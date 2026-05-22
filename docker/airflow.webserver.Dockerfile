FROM apache/airflow:2.9.0

USER root
RUN mkdir -p /opt/dbt/logs && chmod -R 777 /opt/dbt/logs

USER airflow
COPY requirements.txt /requirements.txt
RUN pip install --no-cache-dir -r /requirements.txt

CMD ["airflow", "webserver"]