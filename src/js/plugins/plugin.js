const allPlugins = [];

const registerPlugin = plugin => {
  allPlugins.push(plugin);
};

module.exports = {
  allPlugins,
  registerPlugin
};
