const initBlockTable = (rows = 15, columns = 15) => ({
  blockPanel: [[]]
});

const moveBlockTable = state => ({
  blockPanel: state.blockPanel
});

const keyBlockTable = (key, state) => ({
  blockPanel: state.blockPanel
});

const joinBlockTable = state => (state.blockPanel);

module.exports = {
  initBlockTable,
  moveBlockTable,
  keyBlockTable,
  joinBlockTable
};
