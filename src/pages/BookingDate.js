import React, { useState, useEffect } from "react";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import TimeSlots from './TimeSlots';
import "../assets/styles/appointment.css";
import { useNavigate } from 'react-router-dom';
import axios from "axios";

function BookingDate() {
    const [name, setName] = useState("");
    const [phoneNo, setPhoneNo] = useState("");
    const [status, setStatus] = useState("Pending");
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        name: '',
        phoneNo: '',
    });
    const [selectedService, setSelectedService] = useState({ servicesCode: "", servicesDesc: "", duration: 0 });
    const [services, setServices] = useState([]);
    const [bookedSlots, setBookedSlots] = useState([]);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState({ startTime: null, endTime: null });
    const [selectedStaff, setSelectedStaff] = useState({ _id: "", staffName: "" });
    const [staff, setStaff] = useState([]);

    const user = JSON.parse(localStorage.getItem('user'));
    const loginId = user ? user._id : null;

    const minDate = new Date();

    const handleDateChange = (date) => {
        setSelectedDate(date);
        fetchBookedSlots(formatDateToString(date));
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get('http://localhost:5001/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        }
    };

    const fetchStaff = async () => {
        try {
            const response = await axios.get('http://localhost:5001/staff');
            setStaff(response.data);
        } catch (error) {
            console.error('Error fetching staff:', error);
        }
    };

    const fetchProfile = async (userId) => {
        console.log(`Fetching profile for user ID: ${userId}`);
        try {
            const response = await axios.get(`http://localhost:5001/profile/${userId}`);
            setProfile(response.data);
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };

    const fetchBookedSlots = async (date) => {
        try {
            const response = await axios.get('http://localhost:5001/bookedSlots', { params: { date } });
            setBookedSlots(response.data);
        } catch (error) {
            console.error('Error fetching booked slots:', error);
        }
    };

    const handleBooking = async () => {
        if (!selectedStaff) {
            alert("Please select a staff.");
            return;
        }
        if (!selectedService) {
            alert("Please select a service.");
            return;
        }
        if (!selectedDate) {
            alert("Please select a date.");
            return;
        }
        if (!selectedTime.startTime || !selectedTime.endTime) {
            alert("Please select a time slot before booking.");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5001/book', {
                userId: loginId,
                date: formatDateToString(selectedDate),
                serviceCode: selectedService.servicesCode,
                serviceDesc: selectedService.servicesDesc,
                staffName: selectedStaff.staffName,
                staffID: selectedStaff._id,
                startTime: selectedTime.startTime,
                endTime: selectedTime.endTime,
                status: status,
            });
            alert(response.data.message);
            fetchBookedSlots(formatDateToString(selectedDate));
            setSelectedTime({ startTime: null, endTime: null });
            setSelectedService({ servicesCode: "", servicesDesc: "", duration: 0 });
            setSelectedStaff({ _id: "", staffName: "" });
            setSelectedDate(null);
        } catch (error) {
            console.error('Error booking slot:', error);
            alert('Failed to book slot. Please try again.');
        }
    };

    useEffect(() => {
        fetchProfile(loginId);
        fetchServices();
        fetchStaff();
    }, []);

    const formatDateToString = (date) => {
        if (!(date instanceof Date)) {
            throw new Error("Input must be a Date object");
        }
        return new Date(Date.UTC(
            date.getFullYear(),
            date.getMonth(),
            date.getDate(),
            0,
            0,
            0
        )).toISOString().split('T')[0];
    };

    const handleServiceChange = (e) => {
        const selectedService = services.find(service => service.servicesCode === e.target.value);
        setSelectedService(selectedService || { servicesCode: "", servicesDesc: "", duration: 0 });
    };

    const handleStaffChange = (e) => {
        const selectedStaff = staff.find(staff => staff._id === e.target.value);
        setSelectedStaff(selectedStaff || { _id: "", staffName: "" });
    };

    const viewCustomer = (customerId, customerName) => {
        navigate(`/appListByCust/${customerId}`, { state: { name: customerName } });
    };

    return (
        <>
            <div className="header">
                <div className="topLogo" />
                <ul>
                    <li><a className="active" href="/Dashboard">Home</a></li>
                    <li><a className="active" href="/ProfileForm">Profile</a></li>
                    <li><a className="active" href="/ReviewBooking">Feedback</a></li>
                    {/*<li><a*/}
                    {/*    className="active"*/}
                    {/*    onClick={() => viewCustomer(loginId, loginId)}*/}
                    {/*    href="#" // Add href="#" to prevent default link behavior if needed*/}
                    {/*>*/}
                    {/*    Appointment*/}
                    {/*</a></li>*/}
                </ul>
            </div>
            <div className="app-container">
                <div className="booking-header">
                    <h2>BOOKING</h2>
                </div>
                <div className="page-container">
                    <div className="form-container">
                        <div className="form-group">
                            <div className="lbl"><label htmlFor="name"><b>Name</b></label></div>
                            <div className="inp"><input type="text" placeholder="Enter Name" name="name" value={profile.name} onChange={(e) => setName(e.target.value)} required disabled={false} /></div>

                            <div className="lbl"><label htmlFor="phoneNo"><b>Phone No</b></label></div>
                            <div className="inp"><input type="text" placeholder="Enter Phone Number" name="phoneNo" value={profile.phoneNo} onChange={(e) => setPhoneNo(e.target.value)} required /></div>

                            <div className="lbl"><label htmlFor="hairstylists"><b>Hair Stylists</b></label></div>
                            <div className="inp">
                                <select className="select-Opt" name="staff" value={selectedStaff._id} onChange={handleStaffChange} required>
                                    <option value="">Select a Hair Stylist</option>
                                    {staff.map(staff => (
                                        <option key={staff._id} value={staff._id}>{staff.staffName}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="lbl"><label htmlFor="services"><b>Services</b></label></div>
                            <div className="inp">
                                <select className="select-Opt" name="services" value={selectedService.servicesCode} onChange={handleServiceChange} required>
                                    <option value="">Select a Service</option>
                                    {services.map(service => (
                                        <option key={service.servicesCode} value={service.servicesCode}>{service.servicesDesc}</option>
                                    ))}
                                </select>
                            </div>
                            <button type="button" className="btnSubmit" onClick={handleBooking}>Book</button>
                        </div>
                    </div>
                    <div className="calendar-container">
                        <Calendar
                            className="calendarStyle"
                            onChange={handleDateChange}
                            value={selectedDate}
                            minDate={minDate} // Disable past dates
                        />
                        {selectedDate && <TimeSlots bookedSlots={bookedSlots} onTimeSelect={setSelectedTime} selectedTime={selectedTime.startTime} serviceDuration={selectedService.duration} />}
                    </div>
                </div>
            </div>
        </>
    );
}

export default BookingDate;
