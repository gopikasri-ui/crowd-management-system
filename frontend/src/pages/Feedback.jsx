import { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Feedback() {
  const [form, setForm] = useState({
    name: "", email: "", rating: 5, message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const fetchFeedbacks = async () => {
    try {
      const [fbRes, statsRes] = await Promise.all([
        axios.get("http://localhost:8000/api/feedback/all"),
        axios.get("http://localhost:8000/api/feedback/stats"),
      ]);
      setFeedbacks(fbRes.data.feedbacks || []);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8000/api/feedback/submit",
        form
      );
      setSubmitted(true);
      fetchFeedbacks();
    } catch {
      alert("Submission failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-cyan-400">
            Feedback
          </h1>
          <p className="text-gray-400 mt-1">
            Help us improve the AI Crowd Management System
          </p>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-900 border border-cyan-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 uppercase">Total Reviews</p>
              <p className="text-3xl font-bold text-cyan-400 mt-1">
                {stats.total}
              </p>
            </div>
            <div className="bg-gray-900 border border-yellow-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 uppercase">Avg Rating</p>
              <p className="text-3xl font-bold text-yellow-400 mt-1">
                {stats.avg_rating} ★
              </p>
            </div>
            <div className="bg-gray-900 border border-green-500/20 rounded-xl p-4 text-center">
              <p className="text-xs text-gray-400 uppercase">5 Star Reviews</p>
              <p className="text-3xl font-bold text-green-400 mt-1">
                {stats.five_stars}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>
            {submitted ? (
              <div className="bg-green-500/10 border border-green-500 rounded-2xl p-8 text-center">
                <p className="text-5xl mb-4">✅</p>
                <p className="text-2xl font-bold text-green-400">Thank you!</p>
                <p className="text-gray-400 mt-2">
                  Your feedback has been saved permanently.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({ name: "", email: "", rating: 5, message: "" });
                  }}
                  className="mt-6 px-6 py-3 bg-cyan-500 text-gray-950 font-bold rounded-xl"
                >
                  Submit Another
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-gray-900 border border-cyan-500/20 rounded-2xl p-6 space-y-4"
              >
                <h2 className="text-lg font-bold text-white">
                  Submit Feedback
                </h2>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  placeholder="Your name"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                />
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                  placeholder="Your email"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500"
                />
                <div>
                  <p className="text-xs text-cyan-400 uppercase mb-2">
                    Rating: {form.rating} / 5
                  </p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setForm({ ...form, rating: star })}
                        className="text-3xl transition"
                        style={{ color: star <= form.rating ? "#facc15" : "#4b5563" }}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  required
                  rows={4}
                  placeholder="Tell us what you think..."
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-cyan-500 resize-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-cyan-500 hover:bg-cyan-400 text-gray-950 font-bold py-3 rounded-xl transition"
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </form>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-white">
                All Feedback ({feedbacks.length})
              </h2>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-cyan-400 hover:underline"
              >
                {showAll ? "Show Less" : "Show All"}
              </button>
            </div>

            {feedbacks.length === 0 ? (
              <div className="bg-gray-900 border border-gray-700 rounded-xl p-8 text-center">
                <p className="text-4xl mb-3">💬</p>
                <p className="text-gray-400">No feedback yet</p>
                <p className="text-gray-500 text-xs mt-1">
                  Be the first to submit feedback!
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {(showAll ? feedbacks : feedbacks.slice(0, 5)).map((fb) => (
                  <div
                    key={fb.id}
                    className="bg-gray-900 border border-gray-700 rounded-xl p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-white text-sm">
                          {fb.name}
                        </p>
                        <p className="text-xs text-gray-500">{fb.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-yellow-400 text-sm">
                          {renderStars(fb.rating)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {fb.date}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mt-2">
                      {fb.message}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}