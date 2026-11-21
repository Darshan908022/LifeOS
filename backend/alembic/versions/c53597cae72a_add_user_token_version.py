
"""add user token version

Revision ID: c53597cae72a
Revises: 095cbaec5aff
Create Date: 2026-11-21 12:57:30.543134
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c53597cae72a'
down_revision: Union[str, Sequence[str], None] = '095cbaec5aff'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        'users',
        sa.Column(
            'token_version',
            sa.Integer(),
            nullable=False,
            server_default=sa.text('0'),
        ),
    )


def downgrade() -> None:
    op.drop_column('users', 'token_version')
