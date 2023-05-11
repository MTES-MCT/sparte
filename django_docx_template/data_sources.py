import itertools
from inspect import getmembers
from pathlib import Path

from django.core.exceptions import ImproperlyConfigured
from django.db.models import F
from docx.shared import Mm
from docxtpl import InlineImage, RichText


class Field:
    data_type = None
    data_label = "Not provided"

    def __init__(self, help=None, examples=None, source=None):
        self.help = help
        if isinstance(examples, list):
            self.examples = [str(e) for e in examples]
        else:
            self.examples = str(examples)
        self.source = source

    def to_str(self, value):
        return str(value)


class CharField(Field):
    data_type = str
    data_label = "String"


class IntField(Field):
    data_type = int
    data_label = "Integer"


class ConverterMixin:
    """Interface to find which context element needs to be converted"""

    def convert(self, docx_engine):
        raise NotImplementedError("This method (convert) needs to be implemented")


class Image(ConverterMixin):
    """Define the image to add to the template"""

    def __init__(self, img_path, width=None, height=None):
        """Initialize an image to be merged into the final document

        Parameters
        ==========
        . img_path: file path to a png
        . width: horizontal size of the image in the docx in millimeters
        . height: vertical size of the image in the docx in millimeters
        """
        if not Path(img_path).is_file():
            raise ValueError("Provided path is not a file")
        self.img_path = img_path
        self.width = Mm(width) if width else None
        self.height = Mm(height) if height else None

    def convert(self, docx_engine):
        """Return docx_template equivalent of this image, hydrating with the
        docx_template that will be merged"""
        return InlineImage(
            docx_engine,
            self.img_path,
            width=self.width,
            height=self.height,
        )


class HyperLink(ConverterMixin):
    """Define an hyperlink to be added to the template."""

    def __init__(self, link, text=None):
        """link: the url where the reader can go
        text: the string that will appear in the doc"""
        self.link = link
        if text:
            self.text = text
        else:
            self.text = link

    def convert(self, docx_engine):
        """Return docx_template equivalent of this hyperlink, hydrating with the
        docx_template that will be merged"""
        rt = RichText()
        rt.add(
            self.text,
            url_id=docx_engine.build_url_id(self.link),
        )
        return rt


class DataSource:
    # human readible title or name
    label = None
    # still for human, to let dev explains what is this data source (enable markdown)
    description = None
    # needed to build url automatically with required arguments
    url_args = None

    def __init__(self, class_path):
        self.class_path = class_path

    def get_file_name(self):
        """You can overide this method to set a specific filename to files generated
        with this datasource.If this method raise AttributeError, the name will be set
        with TemplateDocx rules."""
        raise AttributeError("No file name defined")

    def get_label(self):
        if not self.label:
            raise ImproperlyConfigured("DataSource.label is not set.")
        return self.label

    def get_description(self):
        if not self.description:
            raise ImproperlyConfigured("DataSource.description is not set.")
        return self.description

    def get_url(self):
        """Keys are the required arguments to get all context. For example,
        get_context_data could return about all informations about a person but you
        would need to provide person_id ==> get_context_data(person_id=23)

        Those informations are also required for url building

        Example of keys_definition:
        {
            "pk": "int",
            "label": "slug",
        }
        Would retur: "<int:pk>/<slug:label>"
        """
        parts = [f"<{tags_type}:{name}>" for name, tags_type in self.url_args.items()]
        return "/".join(parts)

    def filter_url_args(self, url_kwargs):
        """Return only data_source parameters from a list of parameters"""
        return {n: v for n, v in url_kwargs.items() if n in self.url_args}

    def get_context_data(self, **keys: dict()) -> dict():
        raise ImproperlyConfigured("DataSource.get_context_data() is not defined.")


# rename as DataViews ? it's more close to class based views than to models
class ModelDataSource(DataSource):
    # seems a very django way to go to looks like classical django stuff
    model = None
    queryset = None
    fields = None

    def get_data_fields(self):
        """Return all fields of the datasource ordered by name.
        DataSource fields must inherit from Field class."""
        fields = {n: v for n, v in getmembers(self) if isinstance(v, Field)}
        return {k: fields[k] for k in sorted(fields.keys())}

    def get_data_definition(self) -> dict():
        """Return a list of all items that is available in this datasource. It's used by
        DataSourceView.

        Return example
        ==============
        [
            {
                "name": "item1",
                "type": "string",
                "help": "a description of the item",
                "examples_values": ["hello", "two", "gamma",],
            },
            {
                "name": "category",
                "type": "int",
                "help": "worker category number",
                "examples_values": [1, 2, 3,],
            },
            ...
        ]
        """
        definition = []
        for field_name, field_value in self.get_data_fields().items():
            definition.append(
                {
                    "name": field_name,
                    "type": field_value.data_label,
                    "help": field_value.help,
                    "examples_values": ", ".join(field_value.examples),
                }
            )
        return definition

    def get_queryset(self):
        """Return an initialized Queryset"""
        if self.queryset is not None:
            return self.queryset.all()
        elif self.model is not None:
            return self.model._default_manager.all()
        else:
            raise ImproperlyConfigured(
                "DataSource is missing a QuerySet. Define "
                "DataSource.model or DataSource.queryset, or override "
                "DataSource.get_queryset()."
            )

    def get_filtered_queryset(self, **keys):
        """Apply a simple filtering, usefull for pk filtering for example. Remember that
        queryset first result only is interesting"""
        # filter keys to be sure there is only expected filters
        keys = self.filter_url_args(keys)
        queryset = self.get_queryset()
        queryset = queryset.filter(**keys)
        return queryset

    def get_queryset_fields(self):
        """Return fields listed according to DataField listed in the DataSource. Source
        property is used if defined else it's the field name."""
        simple_fields = []
        expression_fields = dict()
        for field_name, field_value in self.get_data_fields().items():
            if field_value.source:
                expression_fields[field_name] = F(field_value.source)
            else:
                simple_fields.append(field_name)
        return simple_fields, expression_fields

    def get_context_data(self, **keys: dict()) -> dict():
        """
        Return dict of items for completing a docx according to keys parameter.
        The return value must be an iterable and may be an instance of
        `QuerySet` in which case `QuerySet` specific behavior will be enabled.
        """
        queryset = self.get_filtered_queryset(**keys)
        fields, expression = self.get_queryset_fields()
        queryset = queryset.values(*fields, **expression)
        # TODO force dict ?
        return queryset.first()

    def get_example(self, example_number):
        """Return a specific example from all possible combinations."""
        combinations = self.get_all_example_combinations()
        return combinations[example_number]

    def get_all_example_combinations(self):
        """Generate all examples combinations possible"""
        # return Union(list[list[Any]]|list[Any])
        fields = self.get_data_fields()
        examples = list()
        for _name, field in fields.items():
            if isinstance(field.examples, list):
                examples.append(field.examples)
            else:
                examples.append([None])
        keys = self.get_data_fields().keys()
        combinations = list()
        for instance in itertools.product(*examples):
            combinations.append(dict(zip(keys, instance)))
        return combinations
