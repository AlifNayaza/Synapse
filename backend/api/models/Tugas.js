const mongoose = require('mongoose');

const TugasSchema = new mongoose.Schema({
    judul: { type: String, required: true },
    deskripsi: { type: String, required: true },
    tenggat: { type: Date, required: true },
    mataKuliahId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },
    tanggalBuka: { type: Date, default: Date.now },
    lampiranUrl: { type: String } // <<< TAMBAHKAN FIELD INI
}, { timestamps: true });

module.exports = mongoose.model('Tugas', TugasSchema);