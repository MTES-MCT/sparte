def is_artif_case(
    code_cs: str,
    code_us: str,
    true_value=1,
    false_value=0,
) -> str:
    """
    true_value and false_value are optional parameters

    The default values are for working with sqlite (which does not have a proper boolean type),
    but you can change them to work with other databases.
    """

    return f""" CASE
        /* CS 1.1 */
        WHEN {code_cs} = 'CS1.1.1.1' THEN {true_value}
        WHEN {code_cs} = 'CS1.1.1.2' THEN {true_value}
        WHEN {code_cs} = 'CS1.1.1.1' AND {code_us} != 'US1.3' THEN {true_value}
        WHEN {code_cs} = 'CS1.1.2.1' THEN {true_value}
        WHEN {code_cs} = 'CS1.1.2.2' THEN {true_value}

        /* CS 2.2 */
            /* CS 2.2.1 */
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US5' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US235' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.1' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.4' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.1.5' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US4.3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US6.1' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.1' AND {code_us} = 'US6.2' THEN {true_value}

            /* CS 2.2.2 */
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US5' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US235' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.1' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.4' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.1.5' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.2' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US4.3' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US6.1' THEN {true_value}
            WHEN {code_cs} = 'CS2.2.2' AND {code_us} = 'US6.2' THEN {true_value}
        ELSE {false_value}
    END"""
