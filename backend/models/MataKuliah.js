const mongoose = require('mongoose');

const MataKuliahSchema = new mongoose.Schema({
    nama: { type: String, required: true },
    kode: { type: String, required: true, unique: true },
    deskripsi: { type: String },
    dosenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mahasiswaIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('MataKuliah', MataKuliahSchema);