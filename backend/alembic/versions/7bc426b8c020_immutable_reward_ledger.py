"""Make ledger rows immutable at the database boundary."""

from alembic import op

revision = "7bc426b8c020"
down_revision = "479cf5c664c0"
branch_labels = None
depends_on = None


def upgrade():
    op.execute("""
        CREATE FUNCTION reject_ledger_mutation() RETURNS trigger AS $$
        BEGIN
            RAISE EXCEPTION 'reward_ledger is append-only';
        END;
        $$ LANGUAGE plpgsql
    """)
    op.execute("""
        CREATE TRIGGER reward_ledger_immutable
        BEFORE UPDATE OR DELETE ON reward_ledger
        FOR EACH ROW EXECUTE FUNCTION reject_ledger_mutation()
    """)


def downgrade():
    op.execute("DROP TRIGGER reward_ledger_immutable ON reward_ledger")
    op.execute("DROP FUNCTION reject_ledger_mutation()")
