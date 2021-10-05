from pandas import DataFrame

from public_data.models import ArtifCommune


class ConsommationDataframe:
    """Build a dataframe of the space consommation according to:
    * project start and end analysis period
    * cities included in project's area

    1. evaluate years to keep, exclude and sum (indexes of dataframes)
    2. load raw data in the dataframe
    """

    def __init__(self, project):
        self.raw_df = None
        self.df_final = None
        self.project = project
        # bondaries of the analysos
        self.year_min = int(self.project.analyse_start_date)
        self.year_max = int(self.project.analyse_end_date)
        # usefull indexes for calculations
        self.indexes = set()
        self.index_to_exclude = set()
        self.index_to_keep = set()
        self.index_to_sum = set()

    def build(self) -> DataFrame:
        self.init_indexes()
        self.load_dataframe()

        # narrow down df on the year inside the project scope
        self.df_final = self.raw_df.loc[self.index_to_keep]
        # add the sum of the previous year on top
        self.df_final = self.add_previous_years_sum_row(self.df_final)
        # add the total line at the bottom of the df
        self.df_final = self.add_total_row(self.df_final)
        # add progression columns
        self.df_final = self.add_progression_columns(self.df_final)
        # reorder index and columns
        self.df_final = self.reorder_index(self.df_final)

        return self.df_final.T

    def init_indexes(self):
        """initialize all index sets"""
        # indexes available in database
        self.indexes = set(ArtifCommune.list_attr())

        # index that are younger (more recent) than project max year
        for i in self.indexes:
            year = int(i.split("_")[-1])
            if year > self.year_max:
                self.index_to_exclude.add(i)

        # index that are inside project's min and max year
        self.index_to_keep = {
            f"artif_{y}" for y in range(self.year_min, self.year_max + 1)
        }
        self.index_to_keep = set(self.indexes).intersection(self.index_to_keep)

        # index that are older than project min year (we need to sum them)
        self.index_to_sum = self.indexes - self.index_to_keep - self.index_to_exclude

    def load_dataframe(self):
        """Load project's cities raw data into a new dataframe"""
        index = ArtifCommune.list_attr()
        # do not use self.indexes that does not conserve order
        self.raw_df = DataFrame(0, index=index, columns=list())
        for city in self.project.cities.all():
            self.raw_df[city.name] = city.list_artif()

    def add_previous_years_sum_row(self, df: DataFrame) -> DataFrame:
        """Build a dataframe with older years and do the sum"""
        df_sum = self.raw_df.loc[self.index_to_sum]
        # do the sum for each city
        df_sum = df_sum.sum()
        # create a dataframe from the series of sum
        df_sum = DataFrame(df_sum, index=df.columns, columns=[f"Avant {self.year_min}"])
        # transpose result
        df_sum = df_sum.T
        # append the row on top of the df
        df_final = df_sum.append(df)
        return df_final

    def add_total_row(self, df: DataFrame) -> DataFrame:
        total = DataFrame(df.sum(), index=df.columns, columns=["Total"])
        total = total.T
        return df.append(total)

    def add_progression_columns(self, df: DataFrame) -> DataFrame:
        df2 = df.T
        label = f"Avant {self.year_min}"
        total = df2.loc[:, "Total"]
        initial = df2.loc[:, label]
        progression = (total - initial) / initial
        df2["Progression"] = progression
        return df2.T

    def reorder_index(self, df: DataFrame) -> DataFrame:
        indexes = [f"artif_{y}" for y in range(self.year_min, self.year_max + 1)]
        indexes = [f"Avant {self.year_min}"] + indexes + ["Total", "Progression"]
        df = df.reindex(indexes)
        return df

    def get_global_intial(self):
        label = f"Avant {self.year_min}"
        return self.df_final.loc[label].sum()

    def get_global_final(self):
        return self.df_final.loc["Total"].sum()

    def get_global_progression(self):
        return self.get_global_final() - self.get_global_intial()

    def get_global_progression_percent(self):
        return self.get_global_progression() / self.get_global_intial()
