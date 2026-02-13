const db = require('../config/db');
const Client = require('../models/clientModel');
const Passenger = require('../models/passengerModel');

exports.getClients = async (req, res) => {
  try {
    const { search } = req.query;
    let clients = await Client.findAll();

    if (search) {
      const term = search.toLowerCase();
      clients = clients.filter((c) => (
        c.name.toLowerCase().includes(term) ||
        c.surname.toLowerCase().includes(term) ||
        String(c.dni).includes(term) ||
        String(c.cuil ?? '').includes(term) ||
        (c.mail || '').toLowerCase().includes(term)
      ));
    }

    res.status(200).json({ success: true, data: clients });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.getClient = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }
    const passengers = await Passenger.findByClientId(req.params.id);
    res.status(200).json({ success: true, data: { ...client, passengers } });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

exports.createClient = async (req, res) => {
  const connection = await db.getConnection();
  try {
    const { dni, name, surname, cuil, birthday, mail, phone } = req.body;
    if (!dni || !name || !surname || !birthday) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    await connection.beginTransaction();
    const client = await Client.create({ dni, name, surname, cuil, birthday, mail, phone }, connection);

    // Create the initial passenger mirroring the client data
    const passenger = await Passenger.create({
      clientId: client.id,
      dni,
      name,
      surname,
      birthday
    }, connection);

    await connection.commit();
    res.status(201).json({ success: true, data: { ...client, passengers: [passenger] } });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating client:', error);
    res.status(500).json({ success: false, error: 'Error creating client' });
  } finally {
    connection.release();
  }
};

exports.updateClient = async (req, res) => {
  try {
    const updated = await Client.update(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Sync passenger that matches client's dni; fallback to first, else create
    const passengers = await Passenger.findByClientId(req.params.id);
    if (passengers && passengers.length > 0) {
      const targetPassenger = passengers.find((p) => String(p.dni) === String(req.body.dni)) || passengers[0];
      await Passenger.update(targetPassenger.id, {
        dni: req.body.dni ?? targetPassenger.dni,
        name: req.body.name ?? targetPassenger.name,
        surname: req.body.surname ?? targetPassenger.surname,
        birthday: req.body.birthday ?? targetPassenger.birthday
      });
    } else {
      await Passenger.create({
        clientId: req.params.id,
        dni: req.body.dni,
        name: req.body.name,
        surname: req.body.surname,
        birthday: req.body.birthday
      });
    }

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({ success: false, error: 'Error updating client' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    await Client.delete(req.params.id);
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error deleting client:', error);
    res.status(500).json({ success: false, error: 'Error deleting client' });
  }
};
