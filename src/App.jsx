import { useEffect, useState } from "react";
import { HashRouter, Routes, Route, Link, useParams } from "react-router-dom";
import {
  FaArrowUp,
  FaPlay,
  FaPause,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import "./App.css";
import profileImg from "./assets/nabil.jpg";

/* ================= WRAPPER ROUTER ================= */
function AppWrapper() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<QuranApp />} />
        <Route path="/surat/:nomor" element={<QuranApp />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </HashRouter>
  );
}

function Profile() {
  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card shadow-lg p-4 text-center profile-card">
        {/* FOTO */}
        <img
          src={profileImg}
          alt="profile"
          className="rounded-circle mb-3 profile-img"
        />

        {/* NAMA */}
        <h3 className="fw-bold nama ">Rifai Firmansyah</h3>
        <p className="text-muted">12450111227</p>

        {/* INFO */}
        <div className="mt-3 text-start">
          <p>
            <b>🎓 Semester:</b> 2
          </p>
          <p>
            <b>💻 Skill:</b> React, Java
          </p>
          <p>
            <b>📍 Status:</b> Student Developer
          </p>
        </div>

        {/* BUTTON */}
        <Link to="/" className="btn btn-primary mt-3 w-100">
          ⬅ Kembali ke Quran App
        </Link>
      </div>
    </div>
  );
}

/* ================= MAIN APP ================= */
function QuranApp() {
  const { nomor } = useParams();
  const [surat, setSurat] = useState([]);
  const [detailSurat, setDetailSurat] = useState(null);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [qari, setQari] = useState("01");
  const [showSidebar, setShowSidebar] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingAyat, setPlayingAyat] = useState(null);
  const [showDeskripsi, setShowDeskripsi] = useState(false);
  const [openAyat, setOpenAyat] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [tafsir, setTafsir] = useState([]);
  const [openTafsir, setOpenTafsir] = useState(null);

  /* LOAD LIST SURAT */
  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((data) => setSurat(data.data));
  }, []);

  /* LOAD DETAIL BERDASARKAN URL */
  useEffect(() => {
    const nomorSurat = nomor || 1;
    getDetailSurat(nomorSurat);
    setActive(Number(nomorSurat));
  }, [nomor]);

  const getDetailSurat = (nomor) => {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setDetailSurat(data.data);
        stopAudio();
        setPlayingAyat(null);
        setShowDeskripsi(false);
        setOpenAyat(null);
        setOpenTafsir(null);
      });

    fetch(`https://equran.id/api/v2/tafsir/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setTafsir(data.data.tafsir);
      });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  const handlePlayAyat = (ayat) => {
    const url = ayat.audio?.[qari] || ayat.audio;
    if (!url) return;

    if (playingAyat === ayat.nomorAyat) {
      stopAudio();
      setPlayingAyat(null);
      return;
    }

    stopAudio();

    const audio = new Audio(url);
    setCurrentAudio(audio);
    setPlayingAyat(ayat.nomorAyat);

    audio.play();
    audio.onended = () => setPlayingAyat(null);
  };

  const handlePlaySurat = () => {
    const url = detailSurat?.audioFull?.[qari];
    if (!url) return;

    if (playingAyat === "full") {
      stopAudio();
      setPlayingAyat(null);
      return;
    }

    stopAudio();

    const audio = new Audio(url);
    setCurrentAudio(audio);
    setPlayingAyat("full");

    audio.play();
    audio.onended = () => setPlayingAyat(null);
  };

  const toggleTafsir = (nomorAyat) => {
    setOpenTafsir(openTafsir === nomorAyat ? null : nomorAyat);
  };

  const filteredSurat = surat.filter((item) =>
    item.namaLatin.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-dark navbar-custom px-3 position-relative">
        <button
          className="btn btn-light position-absolute start-0 ms-3 d-md-none"
          onClick={() => setShowSidebar(!showSidebar)}
        >
          ☰
        </button>
        <Link
          to="/profile"
          className="btn btn-light position-absolute start-0 ms-3 d-none d-md-block"
        >
          👤
        </Link>

        <Link to="/" className="navbar-brand mx-auto">
          My Quran App
        </Link>

        <button
          className="btn btn-light position-absolute end-0 me-3"
          onClick={() => setShowSearch(!showSearch)}
        >
          🔍
        </button>
      </nav>

      {/* SEARCH */}
      {showSearch && (
        <div className="px-3 py-2 bg-light shadow-sm">
          <input
            type="text"
            placeholder="Cari surat..."
            className="form-control rounded-pill"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR (PAKAI LINK) */}
          <div
            className={`sidebar-mobile ${
              showSidebar ? "show" : ""
            } col-md-3 bg-white vh-100 overflow-auto p-3 shadow-sm`}
          >
            <h5>Daftar Surat</h5>

            {filteredSurat.map((item) => (
              <Link
                key={item.nomor}
                to={`/surat/${item.nomor}`}
                className={`sidebar-item border-bottom ${
                  active === item.nomor ? "active" : ""
                }`}
                onClick={() => setShowSidebar(false)}
              >
                {item.nomor}. {item.namaLatin}
              </Link>
            ))}
          </div>

          {/* CONTENT */}
          <div className="col-md-9 p-4 content-area">
            {!detailSurat ? (
              <h3>Loading...</h3>
            ) : (
              <>
                <h2>
                  {detailSurat.namaLatin} ({detailSurat.nama})
                </h2>

                <p>
                  <b>Arti:</b> {detailSurat.arti}
                </p>
                <p>
                  <b>Jumlah Ayat:</b> {detailSurat.jumlahAyat}
                </p>

                <select
                  className="form-select w-25 mb-3"
                  value={qari}
                  onChange={(e) => setQari(e.target.value)}
                >
                  <option value="01">Abdul Basit</option>
                  <option value="02">Mishary</option>
                  <option value="03">Alafasy</option>
                  <option value="05">Default</option>
                </select>

                <button
                  className={`btn audio-btn mb-2 ${
                    playingAyat === "full" ? "playing" : "stopped"
                  }`}
                  onClick={handlePlaySurat}
                >
                  {playingAyat === "full" ? <FaPause /> : <FaPlay />} Audio
                  Surat
                </button>

                <button
                  className="btn btn-danger mb-2 ms-2"
                  onClick={stopAudio}
                >
                  Stop
                </button>

                <div
                  className="mb-3 float-end"
                  style={{ cursor: "pointer", fontSize: "20px" }}
                  onClick={() => setShowDeskripsi(!showDeskripsi)}
                >
                  {showDeskripsi ? <FaChevronUp /> : <FaChevronDown />}
                </div>

                {showDeskripsi && (
                  <div
                    className="p-3 border rounded bg-light"
                    dangerouslySetInnerHTML={{
                      __html: detailSurat.deskripsi,
                    }}
                  />
                )}

                <hr />

                {/* AYAT */}
                {detailSurat.ayat.map((ayat) => (
                  <div key={ayat.nomorAyat} className="mb-4 ayat-card">
                    <h3
                      className="arab-text"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setOpenAyat(
                          openAyat === ayat.nomorAyat ? null : ayat.nomorAyat,
                        )
                      }
                    >
                      {ayat.teksArab}
                    </h3>

                    {openAyat === ayat.nomorAyat && (
                      <>
                        <p className="text-muted">{ayat.teksLatin}</p>
                        <p>
                          <i>{ayat.teksIndonesia}</i>
                        </p>
                      </>
                    )}

                    <div className="mt-2 d-flex gap-2">
                      <button
                        className={`btn btn-sm ${
                          playingAyat === ayat.nomorAyat
                            ? "btn-warning"
                            : "btn-primary"
                        }`}
                        onClick={() => handlePlayAyat(ayat)}
                      >
                        {playingAyat === ayat.nomorAyat ? (
                          <FaPause />
                        ) : (
                          <FaPlay />
                        )}
                      </button>

                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => toggleTafsir(ayat.nomorAyat)}
                      >
                        📖 Tafsir
                      </button>
                    </div>

                    {openTafsir === ayat.nomorAyat && (
                      <div className="tafsir-box">
                        <b>Tafsir:</b>
                        <p className="mt-2">
                          {tafsir[ayat.nomorAyat - 1]?.teks || "Memuat..."}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* BACK TO TOP */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="back-to-top"
      >
        <FaArrowUp />
      </button>
    </>
  );
}

export default AppWrapper;
