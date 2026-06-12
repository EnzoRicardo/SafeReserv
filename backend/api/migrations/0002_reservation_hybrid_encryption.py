from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="reservation",
            name="encrypted_details",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="reservation",
            name="wrapped_key",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AlterField(
            model_name="reservation",
            name="participants_count",
            field=models.PositiveIntegerField(blank=True, default=1, null=True),
        ),
    ]
