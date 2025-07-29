const mongoose = require('mongoose');

const PertanyaanSchema = new mongoose.Schema({
    soal: { type: String, required: true },
    tipe: { type: String, enum: ['pilihanGanda', 'essay'], required: true },
    pilihan: [String],
    kunciJawaban: { type: String, required: true }
});

const KuisSchema = new mongoose.Schema({
    judul: { type: String, required: true },
    mataKuliahId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },
    pertanyaan: [PertanyaanSchema],
    waktuPengerjaan: { type: Number, required: true }, // Timer saat mengerjakan
    tanggalBuka: { type: Date, default: Date.now },
    tenggat: { type: Date, required: true } // <<< TAMBAHKAN FIELD INI
}, { timestamps: true });

module.exports = mongoose.model('Kuis', KuisSchema);