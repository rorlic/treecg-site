class Config {
  config;
  set(config) {
    this.config = config;
  }
  get(field) {
    return this.config[field]
  }
}

var config = new Config();
export default config;
