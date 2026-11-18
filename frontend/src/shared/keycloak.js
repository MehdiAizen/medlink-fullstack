import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: 'http://localhost:8081',
  realm: 'medlink',
  clientId: 'medlink-app'
});

export default keycloak;