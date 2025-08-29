// File: client/src/components/Dashboard.tsx (React + TypeScript frontend)
import { useEffect, useState } from "react";

type Campaign = {
  id: string;
  name: string;
  status: string;
  effective_status: string;
  objective: string;
  created_time: string;
  start_time: string;
  stop_time: string;
  insights: {
    impressions: string;
    clicks: string;
    spend: string;
    cpc: string;
    ctr: string;
  };
};

export const DashboardTest: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const dataRaw = urlParams.get("data");
    if (dataRaw) {
      try {
        const parsed: Campaign[] = JSON.parse(decodeURIComponent(dataRaw));
        setCampaigns(parsed);
      } catch (e) {
        console.error("Failed to parse campaigns:", e);
      }
    }
  }, []);

  return (
    <div className="p-4 py-28 min-h-screen">
      <h1 className="text-2xl font-bold mb-4"> Your Facebook Campaigns </h1>
      {campaigns.length === 0 ? (
        <p>No campaigns found or not authorized.</p>
      ) : (
        <table className="table-auto w-full border">
          <thead>
            <tr>
              <th>Name </th>
              <th> Status </th>
              <th> Objective </th>
              <th> Clicks </th>
              <th> Impressions </th>
              <th> CTR </th>
              <th> Spend </th>
              <th> CPC </th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id} className="border-t">
                <td>{c.name} </td>
                <td> {c.status} </td>
                <td> {c.objective} </td>
                <td> {c.insights.clicks} </td>
                <td> {c.insights.impressions} </td>
                <td> {c.insights.ctr} </td>
                <td> {c.insights.spend} </td>
                <td> {c.insights.cpc} </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

// File: client/src/components/LoginButton.tsx
import React from "react";

export const LoginButton: React.FC = () => {
  const handleLogin = () => {
    window.location.href = "http://localhost:1000/api/auth/facebook/login";
  };

  return (
    <div className="pt-11 mt-11">
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded">
        {" "}
        Login with Facebook{" "}
      </button>
    </div>
  );
};
