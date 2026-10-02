import { useEffect, useState } from "react";
import Heading from "../../components/Heading";
import Button from "../../components/Button";
import Icon from "../../components/Icon";
import { listMonthlyCustomers, createMonthlyCustomer } from "../../api/monthlyCustomers";
import { listVehicleTypes } from "../../api/vehicleTypes";

export default function MonthlyCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    ho_ten: "",
    so_dien_thoai: "",
    bien_so_dang_ky: "",
    loai_xe_id: "",
    ngay_het_han: "",
  });

  useEffect(() => {
    Promise.all([listMonthlyCustomers().then(setCustomers), listVehicleTypes().then(setVehicleTypes)])
      .catch(() => { setCustomers([]); setVehicleTypes([]); })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await createMonthlyCustomer({
        ...formData,
        loai_xe_id: Number(formData.loai_xe_id),
      });
      setShowModal(false);
      setCustomers([]);
      window.location.reload();
    } catch (err) {
      alert("Lỗi: " + (err.response?.data?.detail || err.message));
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <Heading level={2}>Quản lý khách hàng vé tháng</Heading>
        <Button onClick={() => setShowModal(true)}>
          <Icon name="plus" size={16} />
          Thêm khách hàng
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Đang tải...</p>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>SĐT</th>
                <th>Biển số</th>
                <th>Loại xe</th>
                <th>Ngày hết hạn</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-sm text-gray-500">
                    Chưa có khách hàng nào
                  </td>
                </tr>
              ) : (
                customers.map((c) => {
                  const vt = vehicleTypes.find((v) => v.id === c.loai_xe_id);
                  return (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td>{c.ho_ten}</td>
                      <td>{c.so_dien_thoai || "-"}</td>
                      <td>{c.bien_so_dang_ky}</td>
                      <td>{vt?.ten_loai || c.loai_xe_id}</td>
                      <td>{c.ngay_het_han}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <Icon name="plus" />
            </div>
            <Heading level={2}>Thêm khách hàng vé tháng</Heading>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Họ tên</label>
                <input
                  type="text"
                  value={formData.ho_ten}
                  onChange={(e) => setFormData({ ...formData, ho_ten: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.so_dien_thoai}
                  onChange={(e) => setFormData({ ...formData, so_dien_thoai: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Biển số đăng ký</label>
                <input
                  type="text"
                  value={formData.bien_so_dang_ky}
                  onChange={(e) => setFormData({ ...formData, bien_so_dang_ky: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Loại xe</label>
                <select
                  value={formData.loai_xe_id}
                  onChange={(e) => setFormData({ ...formData, loai_xe_id: e.target.value })}
                  required
                >
                  <option value="">Chọn loại xe</option>
                  {vehicleTypes.map((vt) => (
                    <option key={vt.id} value={vt.id}>{vt.ten_loai}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Ngày hết hạn</label>
                <input
                  type="date"
                  value={formData.ngay_het_han}
                  onChange={(e) => setFormData({ ...formData, ngay_het_han: e.target.value })}
                  required
                />
              </div>
              <div className="modal-actions">
                <Button variant="outline" onClick={() => setShowModal(false)}>Hủy</Button>
                <Button type="submit">Thêm</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
