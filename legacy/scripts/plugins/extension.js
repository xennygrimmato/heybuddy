registerPlugin({
  name: 'Voice assistant',
  icon: 'mic',
  queries: [
    'bye | good bye', 'close',
    'stay open',
  ],
  addCommandHandler: (commander) => {
  }
});
