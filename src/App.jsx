import { useEffect, useState } from "react";
import { FaArrowUp, FaPlay, FaPause } from "react-icons/fa";
import "./App.css";

function App() {
  const [surat, setSurat] = useState([]);
  const [detailSurat, setDetailSurat] = useState(null);
  const [active, setActive] = useState(null);
  const [search, setSearch] = useState("");
  const [qari, setQari] = useState("01");

  const [currentAudio, setCurrentAudio] = useState(null);
  const [playingAyat, setPlayingAyat] = useState(null);
  const [showDeskripsi, setShowDeskripsi] = useState(false);
  const [openAyat, setOpenAyat] = useState(null); // 🔥 NEW

  useEffect(() => {
    fetch("https://equran.id/api/v2/surat")
      .then((res) => res.json())
      .then((data) => setSurat(data.data));

    getDetailSurat(1);
    setActive(1);
  }, []);

  const getDetailSurat = (nomor) => {
    fetch(`https://equran.id/api/v2/surat/${nomor}`)
      .then((res) => res.json())
      .then((data) => {
        setDetailSurat(data.data);
        stopAudio();
        setPlayingAyat(null);
        setShowDeskripsi(false);
        setOpenAyat(null);
      });
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      setCurrentAudio(null);
    }
  };

  // 🎧 AYAT
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

  // 🎧 SURAT
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

  const filteredSurat = surat.filter((item) =>
    item.namaLatin.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <>
      {/* NAVBAR */}
      <nav className="navbar navbar-dark px-4 navbar-custom d-flex justify-content-between">
        <span className="navbar-brand mb-0 h1">📖 Quran App</span>

        <input
          type="text"
          placeholder="🔍 Cari surat..."
          className="form-control w-25 rounded-pill"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </nav>

      <div className="container-fluid">
        <div className="row">
          {/* SIDEBAR */}
          <div className="col-md-3 bg-light vh-100 overflow-auto p-3">
            <h5>Daftar Surat</h5>

            {filteredSurat.map((item) => (
              <div
                key={item.nomor}
                className={`sidebar-item border-bottom ${
                  active === item.nomor ? "active" : ""
                }`}
                onClick={() => {
                  getDetailSurat(item.nomor);
                  setActive(item.nomor);
                }}
              >
                {item.nomor}. {item.namaLatin}
              </div>
            ))}
          </div>

          {/* CONTENT */}
          <div className="col-md-9 p-4">
            {!detailSurat ? (
              <h3>Pilih surat</h3>
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
                <p></p>

                {/* QARI */}
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

                {/* AUDIO SURAT */}
                <button
                  className={`btn ${
                    playingAyat === "full" ? "btn-warning" : "btn-success"
                  } mb-2`}
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

                {/* DESKRIPSI */}
                <button
                  className="btn btn-info mb-3 float-end"
                  onClick={() => setShowDeskripsi(!showDeskripsi)}
                >
                  {showDeskripsi ? "Sembunyikan" : "Lihat"} Deskripsi
                </button>

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
                  <div key={ayat.nomorAyat} className="mb-4 p-3 border rounded">
                    {/* 🔥 KLIK TEKS ARAB */}
                    <h3
                      style={{
                        textAlign: "right",
                        cursor: "pointer",
                      }}
                      onClick={() =>
                        setOpenAyat(
                          openAyat === ayat.nomorAyat ? null : ayat.nomorAyat,
                        )
                      }
                    >
                      {ayat.teksArab}
                    </h3>

                    {/* 🔥 LATIN + ARTI (HIDDEN) */}
                    {openAyat === ayat.nomorAyat && (
                      <>
                        <p>{ayat.teksLatin}</p>
                        <p>
                          <i>{ayat.teksIndonesia}</i>
                        </p>
                      </>
                    )}

                    {/* AUDIO */}
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
                      )}{" "}
                      Ayat {ayat.nomorAyat}
                    </button>
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

export default App;
