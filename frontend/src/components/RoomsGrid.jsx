// frontend/src/components/RoomsGrid.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../utils/apiConfig';
import { PlusCircle, Bed, Layers, CheckCircle2, User, Building, Settings2, Check, X } from 'lucide-react';

export default function RoomsGrid() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Room Creator Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [floorNumber, setFloorNumber] = useState('1st Floor');
  const [totalBedsCount, setTotalBedsCount] = useState('3');
  const [btnLoading, setBtnLoading] = useState(false);

  // Editing Sub-State Engine
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [updatedBedCount, setUpdatedBedCount] = useState('3');

  const userData = JSON.parse(localStorage.getItem('bedbox_user') || '{}');
  const isAdmin = userData.role === 'admin';

  const fetchRoomsGrid = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('bedbox_token');
      // 🎯 UPDATED: Changed from localhost to live cloud Render URL
      const response = await axios.get(`${API_BASE_URL}/api/rooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(response.data);
      setError('');
    } catch (err) {
      setError('Could not download live hostel layout mapping sheets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoomsGrid();
  }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!roomNumber.trim()) {
      alert('Please type a valid room number.');
      return;
    }

    try {
      setBtnLoading(true);
      const token = localStorage.getItem('bedbox_token');
      
      const bedsPayload = [];
      const totalBeds = parseInt(totalBedsCount);
      for (let i = 1; i <= totalBeds; i++) {
        bedsPayload.push({ bedNumber: i, status: 'Available' });
      }

      // 🎯 UPDATED: Changed from localhost to live cloud Render URL
      await axios.post(`${API_BASE_URL}/api/rooms`, 
        { roomNumber: roomNumber.trim(), floorNumber, beds: bedsPayload },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setRoomNumber('');
      fetchRoomsGrid(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing room asset compilation.');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 DISPATCH HANDLER: Modify Bed Count Dynamically
  const handleUpdateBedsAllocation = async (roomId) => {
    try {
      const token = localStorage.getItem('bedbox_token');
      const targetBedsCount = parseInt(updatedBedCount);
      
      // Build a clean fresh array sequence matching the target choice index count
      const freshBedsArray = [];
      for (let i = 1; i <= targetBedsCount; i++) {
        freshBedsArray.push({ bedNumber: i, status: 'Available' });
      }

      // 🎯 UPDATED: Use dynamic API_BASE_URL instead of hardcoded Render URL
      await axios.put(`${API_BASE_URL}/api/rooms/${roomId}`, 
        { beds: freshBedsArray },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEditingRoomId(null);
      fetchRoomsGrid(); // Instant refresh layout frame matrix!
    } catch (err) {
      alert('Failed to update bed scale counts for this asset module.');
    }
  };

  if (loading) return <div className="text-sm font-medium text-slate-500 animate-pulse p-4">Synchronizing floor maps and room layouts...</div>;

  const roomsByFloor = rooms.reduce((groups, room) => {
    const floor = room.floorNumber || '1st Floor';
    if (!groups[floor]) groups[floor] = [];
    groups[floor].push(room);
    return groups;
  }, {});

  const sortedFloors = Object.keys(roomsByFloor).sort();

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* 🛠️ TOP CONTROL PANEL BAR */}
      {isAdmin && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <form onSubmit={handleCreateRoom} className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Hostel Asset Management Deck</h4>
                <p className="text-[10px] text-slate-400">Initialize building infrastructure by floors, blocks, and bed matrix counts.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <div>
                <select value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                  <option value="Ground Floor">Ground Floor</option>
                  <option value="1st Floor">1st Floor</option>
                  <option value="2nd Floor">2nd Floor</option>
                  <option value="3rd Floor">3rd Floor</option>
                  <option value="4th Floor">4th Floor</option>
                </select>
              </div>

              <div>
                <input type="text" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} placeholder="e.g., 101" className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all w-24" />
              </div>

              <div>
                <select value={totalBedsCount} onChange={(e) => setTotalBedsCount(e.target.value)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition-all">
                  <option value="1">1 Bed (Single)</option>
                  <option value="2">2 Beds (Double)</option>
                  <option value="3">3 Beds (Triple)</option>
                  <option value="4">4 Beds (Quad)</option>
                </select>
              </div>

              <button type="submit" disabled={btnLoading} className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-sm">
                <PlusCircle className="w-3.5 h-3.5" /> {btnLoading ? "Deploying..." : "Deploy Room"}
              </button>
            </div>
          </form>
        </div>
      )}

      {error && <div className="text-sm text-red-500 p-3 bg-red-50 border border-red-100 rounded-xl">{error}</div>}

      {/* 🏨 DYNAMIC RENDER GROUPS SECTION BY FLOOR */}
      {rooms.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-200 rounded-2xl">
          <p className="text-xs text-slate-400 font-semibold mb-1">No structural rooms compiled in database keys.</p>
          <p className="text-[10px] text-slate-400/70">Use the asset deck control running above to generate your first building section row.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {sortedFloors.map((floorName) => (
            <div key={floorName} className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-1.5">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{floorName} Sections</h3>
                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-md font-bold">
                  {roomsByFloor[floorName].length} Rooms
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {roomsByFloor[floorName].map((room) => (
                  <div key={room._id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between space-y-4">
                    
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900">Room {room.roomNumber}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold">{room.beds.length} Bed Units</p>
                      </div>

                      {/* 🛠️ EDIT TRIGGER ACTION LINK */}
                      {isAdmin && (
                        <div>
                          {editingRoomId === room._id ? (
                            <div className="flex items-center gap-1">
                              <select 
                                value={updatedBedCount} 
                                onChange={(e) => setUpdatedBedCount(e.target.value)}
                                className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[10px] font-bold text-slate-800 focus:outline-none"
                              >
                                <option value="1">1 Bed</option>
                                <option value="2">2 Beds</option>
                                <option value="3">3 Beds</option>
                                <option value="4">4 Beds</option>
                              </select>
                              <button onClick={() => handleUpdateBedsAllocation(room._id)} className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition-all"><Check className="w-3 h-3" /></button>
                              <button onClick={() => setEditingRoomId(null)} className="p-1 bg-slate-200 text-slate-600 rounded hover:bg-slate-300 transition-all"><X className="w-3 h-3" /></button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => {
                                setEditingRoomId(room._id);
                                setUpdatedBedCount(room.beds.length.toString());
                              }} 
                              className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-all flex items-center gap-1"
                            >
                              <Settings2 className="w-3 h-3" /> Config Beds
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {room.beds.map((bed) => {
                        const isOccupied = bed.status === 'Occupied';
                        return (
                          <div key={bed._id || bed.bedNumber} className={`flex items-center justify-between p-2 rounded-xl border text-xs font-semibold ${isOccupied ? 'bg-blue-50/40 border-blue-100 text-blue-800' : 'bg-emerald-50/40 border-emerald-100 text-emerald-800'}`}>
                            <div className="flex items-center gap-2">
                              <Bed className={`w-3.5 h-3.5 ${isOccupied ? 'text-blue-500' : 'text-emerald-500'}`} />
                              <span>Bed {bed.bedNumber}</span>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded-full ${isOccupied ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {isOccupied ? <><User className="w-2.5 h-2.5" /> Occupied</> : <><CheckCircle2 className="w-2.5 h-2.5" /> Available</>}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}