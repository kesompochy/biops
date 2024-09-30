export default interface Query {
  sql: string;
  name: string;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  id: string | number;
  dataSource: string;
}
