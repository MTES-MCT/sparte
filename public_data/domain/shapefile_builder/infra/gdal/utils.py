def multiline_string_to_single_line(string: str) -> str:
    return string.replace("\n", " ").replace("\r", "")
