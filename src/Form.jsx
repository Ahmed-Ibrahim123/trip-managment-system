export default function Form({ data, onChange, onSubmit }) {
    const handleSubmit = (e) => {
        e.preventDefault();
        if (onSubmit) {
            onSubmit(e);
        }
    };

    return (
        <div className="card" style={{ maxWidth: '600px', margin: '0 auto 32px auto' }}>
            <div style={{ marginBottom: '20px' }}>
                <h3 style={{ marginBottom: '8px' }}>➕ إضافة حجز جديد</h3>
                <p className="subtitle">قم بملء بيانات العميل والرحلة أدناه</p>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="input-wrapper">
                    <label htmlFor="clientName">اسم العميل</label>
                    <input
                        type="text"
                        id="clientName"
                        onChange={onChange}
                        name="clientName"
                        value={data.clientName || ''}
                        placeholder='اسم العميل'
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <label htmlFor="mobileNumber">رقم الموبيل</label>
                    <input
                        type="text"
                        id="mobileNumber"
                        onChange={onChange}
                        name="mobileNumber"
                        value={data.mobileNumber || ''}
                        placeholder='رقم الموبيل'
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <label htmlFor="tripName">اسم الرحلة</label>
                    <input
                        type="text"
                        id="tripName"
                        onChange={onChange}
                        name="tripName"
                        value={data.tripName || ''}
                        placeholder='اسم الرحلة'
                        required
                    />
                </div>

                <div className="input-wrapper">
                    <label htmlFor="notes">ملاحظات</label>
                    <input
                        type="text"
                        id="notes"
                        onChange={onChange}
                        name="notes"
                        value={data.notes || ''}
                        placeholder='ملاحظات'
                    />
                </div>

                <button
                    type="submit"
                    className="auth-btn"
                    style={{ marginTop: '16px', width: '100%' }}
                >
                    Add
                </button>
            </form>
        </div>
    );
}