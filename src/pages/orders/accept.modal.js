import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

export default function AcceptModal(props) {
    
    const {register, handleSubmit} = useForm();
    const [modalOpacity, setModalOpacity] = useState(0);

    const acceptOrder = (data) => {
        props.accept(data.estimatedTime);
        props.closeModal();
    };

    useEffect(() => {
        setModalOpacity(1);
    }, []);

    return (
        <div className="modal">
            <div className="modal-underlay" onClick={props.closeModal}></div>
            <div className="modal-container" style={{opacity:modalOpacity}}>
                <div className="modal-header">
                    <i className="fas fa-times fa-2x" onClick={() => props.closeModal()}></i>
                </div>
                <div className="modal-body">
                    <label className="label">Estimated time for delivery</label>
                    <form onSubmit={handleSubmit(acceptOrder)}>
                        <select name="estimatedTime" ref={register()} className="app-select">
                            <option value='15 minutes' className="app-option">15 minutes</option>
                            <option value='30 minutes' className="app-option">30 minutes</option>
                            <option value='45 minutes' className="app-option">45 minutes</option>
                            <option value='1 hour' className="app-option">1 hour</option>
                            <option value='1 hour 15 minutes' className="app-option">1 hour 15 minutes</option>
                            <option value='1 hour 30 minutes' className="app-option">1 hour 30 minutes</option>
                            <option value='2 hours' className="app-option">2 hours</option>
                        </select>
                        <button type="submit" className="button-long">Accept</button>
                    </form>
                </div>
            </div>
        </div>
    );
};