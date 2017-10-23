export default [{
  condition(R) {
    R.when(this.fact && (this.fact.webhook));
  },
  consequence(R) {
    this.actions.push('webhook');
    this.data.webhook = this.fact.webhook;
    R.stop();
  },
}];
