def is_impermeable_case(
    code_cs: str,
    true_value=1,
    false_value=0,
) -> str:
    return f""" CASE
        WHEN {code_cs} = 'CS1.1.1.1' THEN {true_value}
        WHEN {code_cs} = 'CS1.1.1.2' THEN {true_value}
        ELSE {false_value}
    END"""
