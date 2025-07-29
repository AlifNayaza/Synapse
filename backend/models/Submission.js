const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema({
    // Kita tetap menggunakan `default: undefined` sebagai praktik terbaik
    tugasId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tugas', default: undefined },
    kuisId: { type: mongoose.Schema.Types.ObjectId, ref: 'Kuis', default: undefined },
    
    mahasiswaId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    
    // Field Denormalisasi
    namaMahasiswa: { type: String, required: true, trim: true },
    nim: { type: String, sparse: true },
    mataKuliahId: { type: mongoose.Schema.Types.ObjectId, ref: 'MataKuliah', required: true },
    namaMataKuliah: { type: String, required: true, trim: true },

    // Untuk submission tugas
    fileUrl: { type: String },
    nilai: { type: Number },
    feedback: { type: String },

    // Untuk submission kuis
    jawaban: [{
        pertanyaanId: mongoose.Schema.Types.ObjectId,
        jawabanTeks: String,
        aiFeedback: { type: String },
        isBenar: { type: Boolean, default: null }
    }],
    skor: { type: Number },

    logKecurangan: [{
        timestamp: { type: Date, default: Date.now },
        event: { type: String, default: 'Pindah Tab' }
    }],
    
    status: { 
        type: String, 
        enum: ['dinilai', 'dikumpulkan', 'belum_dinilai', 'dikerjakan'],
        default: 'dikumpulkan' 
    },
    tanggalPengumpulan: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// --- PERBAIKAN UTAMA DAN FINAL: Gunakan Partial Index ---
// Index ini HANYA akan berlaku pada dokumen yang memiliki field `tugasId`.
SubmissionSchema.index(
    { tugasId: 1, mahasiswaId: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { tugasId: { $exists: true } } 
    }
);

// Index ini HANYA akan berlaku pada dokumen yang memiliki field `kuisId`.
SubmissionSchema.index(
    { kuisId: 1, mahasiswaId: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { kuisId: { $exists: true } } 
    }
);
// --- AKHIR PERBAIKAN ---

SubmissionSchema.index({ mataKuliahId: 1 });

module.exports = mongoose.model('Submission', SubmissionSchema);