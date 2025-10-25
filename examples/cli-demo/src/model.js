import { Onto, Resource } from '@gftdcojp/resourcebox';

const foaf = Onto.Namespace({
  prefix: 'foaf',
  uri: 'http://xmlns.com/foaf/0.1/',
});

export const Person = Resource.Object({
  '@id': Resource.String({ format: 'uri' }),
  '@type': Resource.Literal([foaf('Person')]),
  name: Resource.String({ property: foaf('name'), required: true, minLength: 1 }),
  email: Resource.String({ property: foaf('mbox'), format: 'email', optional: true }),
});
