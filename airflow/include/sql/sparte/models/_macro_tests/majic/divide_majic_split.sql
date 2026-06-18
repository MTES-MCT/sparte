-- Test-only model: exercises the divide_majic macro so it can be unit tested.
-- A tiny year range (2011 -> 2012) keeps the mocked fixtures small.
-- Excluded from regular runs with: dbt build --exclude tag:macro_unit_test
{{ config(materialized='view', tags=['macro_unit_test']) }}

select
    commune_code,
    conso_2011::int as conso_2011
from (
    {{ divide_majic('76676', '97601', start_year=2011, end_year=2012) }}
) as divided
