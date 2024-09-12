const getCsrfToken = (): string | null => {
  const name = 'csrftoken';
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const trimmedCookie = cookie.trim();

    if (trimmedCookie.startsWith(name + '=')) {
        return decodeURIComponent(trimmedCookie.substring(name.length + 1));
    }
  }
  return null;
};

export default getCsrfToken;
