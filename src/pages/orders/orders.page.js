import './orders.page.scss';
import socketClient from 'socket.io-client';
import NavBar from '../../components/nav-bar/nav-bar';
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { BACKEND_API, CURRENCY } from '../../util/consts';
import { useDispatch, useSelector } from 'react-redux';
import { addNewOrder, acceptOrder, rejectOrder } from '../../common/actions/orders.actions';
import NewOrderSound from '../../audio/new-order-sound.mp3';
import AcceptModal from './accept.modal';
import RejectModal from './reject.modal';
var socket;

export default function Orders() {
    
    const dispatch = useDispatch();
    const history = useHistory();
    const { orders } = useSelector(state => state.orders);
    const { name } = useSelector(state => state.authentication.restaurant);
    const [acceptModal, setAcceptModal] = useState({show: false, userId:'', time: ''});
    const [rejectModal, setRejectModal] = useState({show: false, userId:'', time: ''});

    const handleAcceptOrder = (estimatedTime) => {
        dispatch(acceptOrder({userId: acceptModal.userId, time: acceptModal.time}));
        socket.emit('accept-order',{
            userId: acceptModal.userId,
            restaurantId: localStorage.getItem('RESTAURANT_ID'),
            restaurantName: name,
            estimatedTime: estimatedTime
        });
    };

    const handleRejectOrder = (rejectReason) => {
        dispatch(rejectOrder({userId: rejectModal.userId, time: rejectModal.time}));
        socket.emit('reject-order',{
            userId: rejectModal.userId,
            restaurantId: localStorage.getItem('RESTAURANT_ID'),
            restaurantName: name,
            rejectReason: rejectReason
        });
    };

    useEffect(() => {
        socket = socketClient (BACKEND_API);
        socket.on('connection', () => {
            socket.emit('send-id',{restaurantId: localStorage.getItem('RESTAURANT_ID')});
        });
        socket.on('new-order', (args) => {
            dispatch(addNewOrder({
                meals: args.meals, 
                deliveryAddress: 
                args.deliveryAddress, 
                userId: args.userId,
                phone: args.phone,
                total: args.total,
                time: args.time,
                status: 'waiting'
            }));
            const newOrderSound = document.getElementById('new-order-sound');
            if(newOrderSound){
                newOrderSound.play();
            }
        });
    },[dispatch, history]);

    return <div className="orders">
        <NavBar loggedIn={true}/>
        <div className="orders-container">
            <div className="header">ORDERS</div>
            {orders.map((order,index) => <div key={index} className="order">
                {order.meals.map((meal,index) => <div key={index} className="order-meal">
                    <div className="order-header">
                        <p>{meal.amount}x &nbsp;{meal.name}</p>
                        <p>{meal.price}{CURRENCY}</p>
                    </div>
                    {meal.notes && <div className="order-meal-modifier">
                        <p className="order-meal-modifier-name">Notes:</p>
                        <p>{meal.notes}</p>
                    </div>}

                    {meal.modifiers.requiredBaseModifier.modifierId !== -1 && 
                    <div className="order-meal-modifier">
                        <p className="order-meal-modifier-name">{meal.modifiers.requiredBaseModifier.modifierName}:</p>
                        <p>{meal.modifiers.requiredBaseModifier.optionName}</p>
                    </div>}
                    
                    {meal.modifiers.requiredModifiers.length > 0 &&
                        meal.modifiers.requiredModifiers.map(modifier => <div className="order-meal-modifier" key={modifier.modifierId}>
                            <p className="order-meal-modifier-name">{modifier.modifierName}:</p>
                            <p>{modifier.optionName}</p>
                        </div>)
                    }

                    {meal.modifiers.optionalModifiers.length > 0 &&
                    <div className="order-meal-modifier">
                        <p className="order-meal-modifier-name">Extras:</p>
                        <p>
                            {meal.modifiers.optionalModifiers.map((modifier, index) => 
                            <React.Fragment key={modifier.modifierId+modifier.optionName}>
                                {modifier.optionName}{index !== meal.modifiers.optionalModifiers.length - 1 && ","}
                            </React.Fragment>
                            )}
                        </p>
                    </div>
                    }
                    {(order.meals.length > 1 && index !== order.meals.length - 1) && <div className="order-meal-divider"></div>}
                </div>)}
                <div className="order-info">
                    <p>Total: {order.total}{CURRENCY}</p>
                    <div className="label">Delivery address: {order.deliveryAddress}</div>
                    <div className="label">Phone: {order.phone}</div>
                </div>
                <div className="order-buttons">
                    {order.status === 'waiting' &&
                    <React.Fragment>
                        <button className="order-button-reject" onClick={() => setRejectModal({show: true, userId: order.userId, time: order.time})}>Reject</button>
                        <button className="order-button-accept" onClick={() => setAcceptModal({show: true, userId: order.userId, time: order.time})}>Accept</button>
                    </React.Fragment>
                    }
                    {order.status === 'accepted' &&
                    <React.Fragment>
                        <button className="order-button-accept">Accepted</button>
                    </React.Fragment>
                    }
                </div>
            </div>)}
        </div>
        {acceptModal.show && <AcceptModal closeModal={() => setAcceptModal({show:false, userId:'', time: ''})} accept={(estimatedTime) => handleAcceptOrder(estimatedTime)}/>}
        {rejectModal.show && <RejectModal closeModal={() => setRejectModal({show:false, userId:'', time: ''})} reject={(rejectReason) => handleRejectOrder(rejectReason)}/>}
        <audio style={{display:'none'}} id="new-order-sound">
	        <source src={NewOrderSound} type="audio/mpeg"/>
	    </audio>
    </div>
}
