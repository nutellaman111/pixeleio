function NewUser(id)
{
    const user = {
        id: id,
        name: 'user ' + (Math.floor(Math.random() * 100) + 1)
    };
    return user;
}

module.exports = { NewUser };