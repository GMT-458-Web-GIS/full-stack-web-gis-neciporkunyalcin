import React, { useState, useEffect } from 'react';
import api from '../services/api';

const Polls = ({ squadId, currentUser }) => {
    const [polls, setPolls] = useState([]);
    const [activePoll, setActivePoll] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newQuestion, setNewQuestion] = useState('Ne yiyelim?');
    const [newOptions, setNewOptions] = useState('Kebab, Burger, Pizza, Sushi');

    useEffect(() => {
        fetchPolls();
    }, [squadId]);

    const fetchPolls = async () => {
        // TODO: Implement get polls endpoint
    };

    const createPoll = async (e) => {
        e.preventDefault();
        try {
            const optionsArray = newOptions.split(',').map(o => o.trim());

            const res = await api.post('/polls', {
                squadId,
                question: newQuestion,
                options: optionsArray
            });

            setActivePoll(res.data.data);
            setShowCreateForm(false);
            setRecommendations([]);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error creating poll');
        }
    };

    const vote = async (pollId, optionId) => {
        try {
            const res = await api.post('/polls/vote', {
                pollId,
                optionId
            });
            setActivePoll(res.data.data);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || 'Error voting');
        }
    };

    const resolvePoll = async () => {
        if (!activePoll) return;
        try {
            const res = await api.post(`/polls/${activePoll._id}/resolve`);

            setActivePoll({ ...activePoll, status: 'completed', winner: res.data.winner });
            setRecommendations(res.data.recommendations);
        } catch (err) {
            console.error(err);
            alert('Error resolving poll');
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow-md mt-4">
            <h3 className="text-xl font-bold mb-4">🍽️ Yemek Oylaması</h3>

            {!activePoll && !showCreateForm && (
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                    Yeni Oylama Başlat
                </button>
            )}

            {showCreateForm && (
                <form onSubmit={createPoll} className="mb-4 space-y-3">
                    <div>
                        <label className="block text-sm font-medium">Soru</label>
                        <input
                            type="text"
                            value={newQuestion}
                            onChange={e => setNewQuestion(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Seçenekler (Virgülle ayır)</label>
                        <input
                            type="text"
                            value={newOptions}
                            onChange={e => setNewOptions(e.target.value)}
                            className="w-full border p-2 rounded"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">Başlat</button>
                        <button onClick={() => setShowCreateForm(false)} className="bg-gray-400 text-white px-4 py-2 rounded">İptal</button>
                    </div>
                </form>
            )}

            {activePoll && (
                <div>
                    <h4 className="font-semibold text-lg">{activePoll.question}</h4>
                    <div className="my-4 space-y-2">
                        {activePoll.options.map(opt => (
                            <div key={opt._id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                <span>{opt.foodType}</span>
                                <div className="flex items-center gap-2">
                                    <span className="font-bold">{opt.votes} Oy</span>
                                    {activePoll.status === 'active' && !activePoll.voters.includes(currentUser.id) && (
                                        <button
                                            onClick={() => vote(activePoll._id, opt._id)}
                                            className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm hover:bg-purple-200"
                                        >
                                            Oy Ver
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {activePoll.status === 'active' && (
                        <button
                            onClick={resolvePoll}
                            className="w-full bg-red-100 text-red-700 py-2 rounded font-semibold hover:bg-red-200"
                        >
                            Oylamayı Bitir & Sonuçları Gör
                        </button>
                    )}

                    {activePoll.status === 'completed' && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded animate-pulse">
                            <h4 className="text-center text-xl font-bold text-green-800">
                                🏆 Kazanan: {activePoll.winner}
                            </h4>
                        </div>
                    )}
                </div>
            )}

            {recommendations.length > 0 && (
                <div className="mt-6">
                    <h4 className="font-bold text-gray-700 mb-2">📍 Önerilen Restoranlar:</h4>
                    <ul className="space-y-2">
                        {recommendations.map(r => (
                            <li key={r._id} className="border p-2 rounded hover:bg-gray-50">
                                <div className="font-semibold">{r.name}</div>
                                <div className="text-sm text-gray-500">{r.address}</div>
                                <div className="text-xs bg-gray-200 inline-block px-1 rounded mt-1">
                                    ⭐ {r.rating} ({r.cuisine_type})
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Polls;
