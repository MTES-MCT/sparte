import requests

SPARTE_SLUG_KEY = "sparte_slug"


class DataGouvException(Exception):
    pass


class DataGouvHandler:
    def __init__(
        self,
        endpoint: str,
        key: str,
        organization_id: str,
    ):
        self.endpoint = endpoint
        self.key = key
        self.organization_id = organization_id

    def _headers(self) -> dict:
        return {"X-API-KEY": self.key}

    def get_organization_datasets(self) -> list[dict]:
        """Récupère tous les datasets de l'organisation (y compris les privés)."""
        url = f"{self.endpoint}/organizations/{self.organization_id}/datasets/"
        datasets = []
        page = 1

        while True:
            response = requests.get(
                url,
                headers=self._headers(),
                params={"page": page, "page_size": 100},
            )
            if not response.ok:
                raise DataGouvException(response.text)

            data = response.json()
            datasets.extend(data.get("data", []))

            if not data.get("next_page"):
                break
            page += 1

        return datasets

    def find_dataset_by_slug(self, slug: str) -> dict | None:
        """Cherche un dataset par son slug sparte dans l'organisation."""
        datasets = self.get_organization_datasets()
        for dataset in datasets:
            extras = dataset.get("extras", {})
            if extras.get(SPARTE_SLUG_KEY) == slug:
                return dataset
        return None

    def create_dataset(
        self,
        slug: str,
        title: str,
        description: str = "TODO",
    ) -> dict:
        """Crée un nouveau dataset (privé par défaut) avec le slug dans extras."""
        url = f"{self.endpoint}/datasets/"
        payload = {
            "title": title,
            "description": description,
            "organization": self.organization_id,
            "private": True,
            "license": "lov2",
            "extras": {SPARTE_SLUG_KEY: slug},
        }

        response = requests.post(url, headers=self._headers(), json=payload)
        if not response.ok:
            raise DataGouvException(response.text)

        return response.json()

    def update_dataset(self, dataset_id: str, **kwargs) -> dict:
        """Met à jour un dataset existant."""
        url = f"{self.endpoint}/datasets/{dataset_id}/"
        response = requests.put(url, headers=self._headers(), json=kwargs)
        if not response.ok:
            raise DataGouvException(response.text)
        return response.json()

    def find_resource_by_slug(self, dataset: dict, slug: str) -> dict | None:
        """Cherche une resource par son slug sparte dans un dataset."""
        for resource in dataset.get("resources", []):
            extras = resource.get("extras", {})
            if extras.get(SPARTE_SLUG_KEY) == slug:
                return resource
        return None

    def create_resource(
        self,
        dataset_id: str,
        slug: str,
        title: str,
        format: str,
    ) -> dict:
        """Crée une nouvelle resource dans un dataset avec le slug dans extras."""
        url = f"{self.endpoint}/datasets/{dataset_id}/resources/"
        payload = {
            "title": title,
            "format": format,
            "filetype": "file",
            "extras": {SPARTE_SLUG_KEY: slug},
        }

        response = requests.post(url, headers=self._headers(), json=payload)
        if not response.ok:
            raise DataGouvException(response.text)

        return response.json()

    def update_resource(self, dataset_id: str, resource_id: str, **kwargs) -> dict:
        """Met à jour une resource existante."""
        url = f"{self.endpoint}/datasets/{dataset_id}/resources/{resource_id}/"
        response = requests.put(url, headers=self._headers(), json=kwargs)
        if not response.ok:
            raise DataGouvException(response.text)
        return response.json()

    def upload_file(
        self,
        local_file_path: str,
        dataset_id: str,
        resource_id: str | None = None,
    ) -> dict:
        """Upload un fichier vers une resource existante ou nouvelle."""
        if resource_id:
            url = f"{self.endpoint}/datasets/{dataset_id}/resources/{resource_id}/upload/"
        else:
            url = f"{self.endpoint}/datasets/{dataset_id}/upload/"

        with open(local_file_path, "rb") as f:
            files = {"file": f}
            response = requests.post(url, headers=self._headers(), files=files)

        if not response.ok:
            raise DataGouvException(response.text)

        return response.json()

    def get_or_create_dataset(self, slug: str, title: str) -> dict:
        """
        Cherche un dataset par slug ou le crée s'il n'existe pas.
        Met à jour le titre si le dataset existe déjà.
        Retourne le dataset complet.
        """
        dataset = self.find_dataset_by_slug(slug)
        if dataset:
            # Met à jour le titre si nécessaire
            if dataset.get("title") != title:
                dataset = self.update_dataset(dataset["id"], title=title)
        else:
            dataset = self.create_dataset(slug=slug, title=title)
        return dataset

    def get_dataset_by_id(self, dataset_id: str) -> dict:
        """Récupère un dataset par son ID."""
        url = f"{self.endpoint}/datasets/{dataset_id}/"
        response = requests.get(url, headers=self._headers())
        if not response.ok:
            raise DataGouvException(response.text)
        return response.json()

    def upload_resource_to_dataset(
        self,
        local_file_path: str,
        dataset_id: str,
        resource_slug: str,
        resource_title: str,
    ) -> dict:
        """
        Upload un fichier vers un dataset existant.
        - Cherche la resource par slug ou la crée
        - Met à jour le titre si nécessaire
        - Upload le fichier
        """
        # Récupère le dataset pour chercher la resource
        dataset = self.get_dataset_by_id(dataset_id)

        # Cherche la resource par slug
        resource = self.find_resource_by_slug(dataset, resource_slug)
        resource_id = resource["id"] if resource else None

        # Upload le fichier
        result = self.upload_file(local_file_path, dataset_id, resource_id)

        if resource_id:
            # Toujours remettre le titre après l'upload car data.gouv l'écrase avec le nom du fichier
            self.update_resource(
                dataset_id,
                resource_id,
                title=resource_title,
            )
        else:
            # Nouvelle resource: met à jour le titre et ajoute le slug
            new_resource_id = result["id"]
            self.update_resource(
                dataset_id,
                new_resource_id,
                title=resource_title,
                extras={SPARTE_SLUG_KEY: resource_slug},
            )

        return result

    def upsert_and_upload(
        self,
        local_file_path: str,
        dataset_slug: str,
        dataset_title: str,
        resource_slug: str,
        resource_title: str,
    ) -> dict:
        """
        Upsert un fichier sur data.gouv.fr.
        - Cherche/crée le dataset par slug
        - Cherche/crée la resource par slug
        - Upload le fichier
        """
        dataset = self.get_or_create_dataset(slug=dataset_slug, title=dataset_title)
        return self.upload_resource_to_dataset(
            local_file_path,
            dataset["id"],
            resource_slug,
            resource_title,
        )

    def delete_resource(self, dataset_id: str, resource_id: str) -> None:
        """Supprime une resource d'un dataset."""
        url = f"{self.endpoint}/datasets/{dataset_id}/resources/{resource_id}/"
        response = requests.delete(url, headers=self._headers())
        if not response.ok:
            raise DataGouvException(response.text)

    def delete_dataset(self, dataset_id: str) -> None:
        """Supprime un dataset."""
        url = f"{self.endpoint}/datasets/{dataset_id}/"
        response = requests.delete(url, headers=self._headers())
        if not response.ok:
            raise DataGouvException(response.text)
