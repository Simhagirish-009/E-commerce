# !/user/bin/env/ bash
set -o errexit #exit or error

pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate 