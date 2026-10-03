-- CreateTable
CREATE TABLE "induction_sessions" (
    "id" TEXT NOT NULL,
    "kode_sesi" TEXT NOT NULL,
    "qr_code" TEXT,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "lokasi" TEXT NOT NULL,
    "topik" TEXT,
    "deskripsi" TEXT,
    "pic_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "induction_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "induction_participants" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "user_id" TEXT,
    "nama" TEXT NOT NULL,
    "perusahaan" TEXT,
    "identitas" TEXT,
    "no_telp" TEXT,
    "email" TEXT,
    "jabatan" TEXT,
    "jenis_kelamin" TEXT,
    "foto_url" TEXT,
    "tipe" TEXT NOT NULL DEFAULT 'EXTERNAL',
    "scan_time" TIMESTAMP(3),
    "scan_method" TEXT,
    "status_hadir" TEXT NOT NULL DEFAULT 'REGISTERED',
    "card_code" TEXT,
    "card_url" TEXT,
    "card_issued_at" TIMESTAMP(3),

    CONSTRAINT "induction_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "induction_media" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "uploaded_by" TEXT,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "induction_media_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "induction_sessions_kode_sesi_key" ON "induction_sessions"("kode_sesi");

-- CreateIndex
CREATE UNIQUE INDEX "induction_participants_session_id_identitas_key" ON "induction_participants"("session_id", "identitas");

-- CreateIndex
CREATE UNIQUE INDEX "induction_participants_session_id_user_id_key" ON "induction_participants"("session_id", "user_id");

-- AddForeignKey
ALTER TABLE "induction_sessions" ADD CONSTRAINT "induction_sessions_pic_id_fkey" FOREIGN KEY ("pic_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "induction_participants" ADD CONSTRAINT "induction_participants_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "induction_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "induction_participants" ADD CONSTRAINT "induction_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "induction_media" ADD CONSTRAINT "induction_media_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "induction_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
