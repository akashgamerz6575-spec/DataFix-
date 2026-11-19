from __future__ import annotations

from io import BytesIO
from typing import Any

import pandas as pd


class DatasetProfileError(ValueError):
    """Raised when a dataset cannot be profiled safely."""


def profile_csv(content: bytes, filename: str) -> dict[str, Any]:
    if not content:
        raise DatasetProfileError("The uploaded file is empty.")

    try:
        frame = pd.read_csv(BytesIO(content), low_memory=False)
    except UnicodeDecodeError as exc:
        raise DatasetProfileError(
            "The CSV encoding could not be read. Please upload a UTF-8 CSV file."
        ) from exc
    except pd.errors.EmptyDataError as exc:
        raise DatasetProfileError("The CSV does not contain a header or data rows.") from exc
    except pd.errors.ParserError as exc:
        raise DatasetProfileError(
            "The CSV structure is invalid or inconsistent. Check its delimiters and quoting."
        ) from exc
    except Exception as exc:  # defensive conversion to a user-readable error
        raise DatasetProfileError("The CSV could not be read.") from exc

    if len(frame.columns) == 0:
        raise DatasetProfileError("No columns were found in the uploaded CSV.")

    row_count, column_count = frame.shape
    if row_count == 0:
        raise DatasetProfileError("The CSV contains column headers but no data rows.")

    missing_by_column = frame.isna().sum()
    column_profiles = []
    for column in frame.columns:
        series = frame[column]
        missing_count = int(missing_by_column[column])
        column_profiles.append(
            {
                "name": str(column),
                "data_type": str(series.dtype),
                "missing_count": missing_count,
                "missing_percent": round((missing_count / row_count) * 100, 2),
                "distinct_count": int(series.nunique(dropna=True)),
            }
        )

    total_cells = row_count * column_count
    missing_cells = int(missing_by_column.sum())
    duplicate_rows = int(frame.duplicated().sum())

    return {
        "filename": filename,
        "row_count": int(row_count),
        "column_count": int(column_count),
        "total_cells": int(total_cells),
        "missing_cells": missing_cells,
        "duplicate_rows": duplicate_rows,
        "columns": column_profiles,
        "notes": [
            "This is an initial profile only. No data has been modified.",
            "A blank string is not automatically treated as a missing value in this first milestone.",
        ],
    }
