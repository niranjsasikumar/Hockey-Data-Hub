export default class MockPool {
  constructor(queryResults) {
    this.queryResults = queryResults;
    this.index = 0;
  }

  query() {
    const result = this.queryResults[this.index];
    this.index++;
    return result;
  }
}