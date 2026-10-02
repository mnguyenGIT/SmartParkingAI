import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

async function listSpots() {
  const res = await fetch(`${API_BASE}/parking-spots`);
  if (!res.ok) throw new Error("Lỗi tải vị trí");
  return res.json();
}

async function getZoneSummary() {
  const res = await fetch(`${API_BASE}/parking-spots/stats/zone-summary`);
  if (!res.ok) throw new Error("Lỗi thống kê");
  return res.json();
}

async function createSpot(payload) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/parking-spots`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(res.clone().json ? "Lỗi tạo vị trí" : "Lỗi tạo vị trí");
  return res.json();
}

async function updateSpot(spotId, payload) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/parking-spots/${spotId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Lỗi cập nhật");
  }
  return res.json();
}

async function deactivateSpot(spotId) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}/parking-spots/${spotId}/deactivate`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Lỗi vô hiệu");
  }
  return res.json();
}

async function listZones() {
  const res = await fetch(`${API_BASE}/zones`);
  return res.json();
}

async function listVehicleTypes() {
  const res = await fetch(`${API_BASE}/vehicle-types`);
  return res.json();
}

export default function ParkingSpotsPage() {
  const [spots, setSpots] = useState([]);
  const [zones, setZones] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [zoneSummary, setZoneSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSpot, setEditingSpot] = useState(null);
  const [formData, setFormData] = useState({
    ma_vi_tri: "",
    khu_vuc_id: "",
    loai_xe_id: "",
    is_active: true,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [spotsData, zonesData, vtData, summaryData] = await Promise.all([
        listSpots().catch(() => []),
        listZones().catch(() => []),
        listVehicleTypes().catch(() => []),
        getZoneSummary().catch(() => []),
      ]);
      setSpots(spotsData);
      setZones(zonesData.filter((z) => z.is_active));
      setVehicleTypes(vtData.filter((v) => v.is_active));
      setZoneSummary(summaryData);
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditingSpot(null);
    setFormData({
      ma_vi_tri: "",
      khu_vuc_id: zones[0]?.id || "",
      loai_xe_id: vehicleTypes[0]?.id || "",
      is_active: true,
    });
    setShowModal(true);
  }

  function openEdit(spot) {
    setEditingSpot(spot);
    setFormData({
      ma_vi_tri: spot.ma_vi_tri,
      khu_vuc_id: spot.khu_vuc_id,
      loai_xe_id: spot.loai_xe_id,
      is_active: spot.is_active,
    });
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const payload = {
        ma_vi_tri: formData.ma_vi_tri,
        khu_vuc_id: Number(formData.khu_vuc_id),
        loai_xe_id: Number(formData.loai_xe_id),
        is_active: formData.is_active,
      };
      if (editingSpot) {
        await updateSpot(editingSpot.id, payload);
      } else {
        await createSpot(payload);
      }
      setShowModal(false);
      await loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  }

  async function handleDeactivate(spot) {
    if (!confirm(`Vô hiệu hóa vị trí ${spot.ma_vi_tri}?`)) return;
    try {
      await deactivateSpot(spot.id);
      await loadData();
    } catch (err) {
      alert("Lỗi: " + err.message);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Quản lý vị trí đỗ</Heading>
        <Button onClick={openCreate}>
          <Icon name="plus" size={16} />
          Thêm vị trí
        </Button>
      </div>

      <div className="dashboard-grid" style={{ marginTop: "13px" }}>
        <div>
          <article className="panel">
            <div className="panel-head">
              <div>
                <Heading level={2}>Tình trạng chỗ trống theo khu vực</Heading>
                <p>Tổng quan lấp đầy</p>
              </div>
            </div>
            <div className="zone-list" style={{ marginTop: "19px" }}>
              {zoneSummary.length === 0 ? (
                <p className="text-sm text-gray-500">Đang tải...</p>
              ) : (
                zoneSummary.map((z, i) => (
                  <div className="zone-row" key={z.khu_vuc_id}>
                    <div className={`zone-letter zone-${i % 3}`}>{z.ten_khu_vuc.slice(-1)}</div>
                    <div className="zone-info">
                      <strong>{z.ten_khu_vuc}</strong>
                      <span>{z.total_spots} chỗ • {z.occupied_spots} đầy</span>
                      <div className="progress">
                        <span style={{ width: z.total_spots > 0 ? `${Math.round((z.occupied_spots / z.total_spots) * 100)}%` : "0%" }} />
                      </div>
                    </div>
                    <b>{z.available_spots} trống</b>
                  </div>
                ))
              )}
            </div>
          </article>
        </div>

        <div>
          <article className="panel" style={{ minHeight: "280px" }}>
            <div className="panel-head">
              <Heading level={2}>Thống kê</Heading>
            </div>
            <div style={{ padding: "10px 0" }}>
              <div className="stat-meta" style={{ marginBottom: "12px" }}>
                <span>Tổng vị trí</span>
                <b className="neutral">{spots.length}</b>
              </div>
              <div className="stat-meta" style={{ marginBottom: "12px" }}>
                <span>Đang trống</span>
                <b className="positive">
                  {spots.filter((s) => s.trang_thai === "trong" || s.trang_thai === "TRONG").length}
                </b>
              </div>
              <div className="stat-meta" style={{ marginBottom: "12px" }}>
                <span>Đã đậu</span>
                <b className="neutral">
                  {spots.filter((s) => s.trang_thai === "da_dat" || s.trang_thai === "DA_DAT").length}
                </b>
              </div>
              <div className="stat-meta" style={{ marginBottom: "12px" }}>
                <span>Hoạt động</span>
                <b className="positive">{spots.filter((s) => s.is_active).length}</b>
              </div>
              <div className="stat-meta">
                <span>Vô hiệu</span>
                <b className="neutral">{spots.filter((s) => !s.is_active).length}</b>
              </div>
            </div>
          </article>
        </div>
      </div>

      <article className="panel" style={{ marginTop: "13px" }}>
        <Heading level={2}>Danh sách vị trí</Heading>
        <p style={{ fontSize: "9px", color: "#9ba29d", marginTop: "4px" }}>
          {spots.filter((s) => s.is_active).length} vị trí đang hoạt động
        </p>
        <div className="table-wrap" style={{ marginTop: "16px" }}>
          <table>
            <thead>
              <tr>
                <th>Mã vị trí</th>
                <th>Khu vực</th>
                <th>Loại xe</th>
                <th>Trạng thái</th>
                <th>Hoạt động</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {spots.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                    Chưa có vị trí nào
                  </td>
                </tr>
              ) : (
                spots.map((spot) => (
                  <tr key={spot.id}>
                    <td>{spot.ma_vi_tri}</td>
                    <td>{spot.zone_name || spot.khu_vuc_id}</td>
                    <td>{spot.vehicle_type_name || spot.loai_xe_id}</td>
                    <td>
                      <span className={`status-badge ${spot.trang_thai === "trong" || spot.trang_thai === "TRONG" || !spot.trang_thai ? "active" : "inactive"}`}>
                        {spot.trang_thai === "da_dat" || spot.trang_thai === "DA_DAT" ? "Đã đặt" :
                         spot.trang_thai === "bao_tri" || spot.trang_thai === "BAO_TRI" ? "Bảo trì" : "Trống"}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${spot.is_active ? "active" : "inactive"}`}>
                        {spot.is_active ? "Có" : "Không"}
                      </span>
                    </td>
                    <td className="text-right">
                      {spot.is_active && (
                        <>
                          <Button variant="ghost" onClick={() => openEdit(spot)} ariaLabel="Sửa">
                            <Icon name="edit" size={14} />
                          </Button>
                          <Button variant="ghost" onClick={() => handleDeactivate(spot)} ariaLabel="Vô hiệu">
                            <Icon name="trash" size={14} />
                          </Button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </article>

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name={editingSpot ? "edit" : "plus"} />
            </div>
            <Heading level={2}>{editingSpot ? "Sửa vị trí" : "Thêm vị trí"}</Heading>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Mã vị trí</label>
                <input
                  type="text"
                  placeholder="VD: A-01"
                  value={formData.ma_vi_tri}
                  onChange={(e) => setFormData({ ...formData, ma_vi_tri: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Khu vực</label>
                <select
                  value={formData.khu_vuc_id}
                  onChange={(e) => setFormData({ ...formData, khu_vuc_id: e.target.value })}
                  required
                >
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.ten_khu_vuc}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Loại xe</label>
                <select
                  value={formData.loai_xe_id}
                  onChange={(e) => setFormData({ ...formData, loai_xe_id: e.target.value })}
                  required
                >
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>{vt.ten_loai}</option>
                  ))}
                </select>
              </div>
              {editingSpot && (
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    />
                    {" Hoạt động"}
                  </label>
                </div>
              )}
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit">{editingSpot ? "Lưu" : "Thêm"}</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
