# Portfolio OLAP Fixture CSVs

These CSVs are starter fixtures for the v2 import and temporal performance workflows.

## Files

- `schwab_positions_2026-03-31.csv`: Schwab-style dated position import with public equity, commodities, municipal bonds, and DBMF.
- `fidelity_positions_2026-04-30.csv`: Fidelity-style dated position import with large blend equity, high-yield bonds, DBMF, and private-credit proxy exposure.
- `generic_positions_no_valuation_date.csv`: Generic import intentionally missing valuation date. The app must require the user to select a valuation date before saving.
- `temporal_snapshot_2026-01-31.csv`: First dated snapshot for temporal testing.
- `temporal_snapshot_2026-02-28.csv`: Second dated snapshot for temporal testing.
- `temporal_snapshot_2026-03-31.csv`: Third dated snapshot for temporal testing.

## Expected Behaviors

- `DBMF` maps to `Alternatives > Liquid Alternatives > Trend Following Managed Futures`.
- `GLD` maps to `Commodities > Precious Metals`.
- `MUB` maps to `Bonds / Credit > Public Bonds > Municipal Bonds`.
- `HYG` maps to `Bonds / Credit > Public Bonds > Junk Bonds`.
- `VCIT` maps to `Bonds / Credit > Public Bonds > Corporate Bonds`.
- `BIZD` maps to `Bonds / Credit > Private Credit > Direct Lending`.
- `PRCR` maps to `Bonds / Credit > Private Credit`.
- Files with `As Of Date` or `Statement Date` should save snapshots without prompting for a date.
- `generic_positions_no_valuation_date.csv` must prompt for a valuation date.

