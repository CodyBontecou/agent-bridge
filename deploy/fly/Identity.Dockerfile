FROM quay.io/keycloak/keycloak:26.8.0
COPY --chown=keycloak:keycloak qr-connect.json /opt/keycloak/data/import/qr-connect.json
RUN /opt/keycloak/bin/kc.sh build --db=postgres --http-relative-path=/auth
ENTRYPOINT ["/opt/keycloak/bin/kc.sh"]
CMD ["start", "--optimized", "--import-realm"]
