export const update = (data) => {
  return {
    type: 'setUsers',
    usernames: (data.users || {}).usernames || [],
  };
};

export const me = (clientName) => {
  return {
    type: 'setClientName',
    clientName,
  };
};

export const reset = () => {
  return {
    type: 'resetUsers',
  };
};
