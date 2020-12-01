const { GraphQLScalarType, Kind } = require ('graphql');

const DurationType = new GraphQLScalarType({
  name: "DurationType",
  description: "A String or an Int union type",
  serialize(value: string | number) {
    return value;
  },
  parseValue(value: string | number) {
    return value;
  },
  parseLiteral(ast: any) {
    switch (ast.kind) {
      case Kind.INT: return parseInt(ast.value, 10);
      case Kind.STRING: return ast.value;
      default:
        return null;
    }
  }
})

export default DurationType;