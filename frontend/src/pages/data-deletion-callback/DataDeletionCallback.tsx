/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Footer } from "@/components/layout/Footer";
import GuestHeader from "@/components/layout/GuestHeader";
import type React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface SignedRequest {
  algorithm: string;
  expires: number;
  issued_at: number;
  user_id: string;
}

const DataDeletionCallback: React.FC = () => {
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleDataDeletionRequest = async () => {
      try {
        // Check if this is a POST request with signed_request
        const urlParams = new URLSearchParams(window.location.search);
        const signedRequest = urlParams.get("signed_request");

        // Generate unique confirmation code
        const confirmationCode = generateConfirmationCode();
        const statusUrl = `https://www.interestminers.com/data-deletion?id=${confirmationCode}`;
        // const statusUrl = `http://localhost:8080/data-deletion?id=${confirmationCode}`;

        if (signedRequest) {
          // Parse the signed request from Facebook
          const parsedRequest = parseSignedRequest(signedRequest);

          if (parsedRequest) {
            // Log the deletion request (in production, save to database)
            console.log(
              `Data deletion request for user: ${parsedRequest.user_id}`
            );

            // Initiate data deletion process
            await initiateDeletion(parsedRequest.user_id, confirmationCode);
          }
        }

        // Always return the required JSON response format
        const deletionResponse = {
          url: statusUrl,
          confirmation_code: confirmationCode,
        };

        setResponse(deletionResponse);

        // Set response headers for JSON (this would be done server-side in production)
        if (typeof window !== "undefined") {
          // For client-side demo, we'll just display the JSON
          console.log("Facebook Data Deletion Response:", deletionResponse);
        }
      } catch (err) {
        setError("Error processing deletion request");
        console.error("Data deletion error:", err);
      }
    };

    handleDataDeletionRequest();
  }, []);

  const generateConfirmationCode = (): string => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `DEL_${timestamp}_${random}`.toUpperCase();
  };

  const parseSignedRequest = (signedRequest: string): SignedRequest | null => {
    try {
      const [encodedSig, payload] = signedRequest.split(".", 2);

      if (!payload) return null;

      // Decode base64url
      const decodedPayload = atob(
        payload.replace(/-/g, "+").replace(/_/g, "/")
      );
      const data = JSON.parse(decodedPayload);

      // In production, you MUST verify the signature using your Facebook App Secret:
      // const crypto = require('crypto');
      // const expectedSig = crypto.createHmac('sha256', FB_APP_SECRET).update(payload).digest();
      // if (Buffer.compare(sig, expectedSig) !== 0) {
      //   throw new Error('Invalid signature');
      // }

      return data;
    } catch (error) {
      console.error("Error parsing signed request:", error);
      return null;
    }
  };

  const initiateDeletion = async (
    userId: string,
    confirmationCode: string
  ): Promise<void> => {
    // In production, this would:
    // 1. Save the deletion request to your database
    // 2. Mark user data for deletion
    // 3. Start background processes to delete user data
    // 4. Send confirmation email to user
    // 5. Log the request for compliance

    console.log(
      `Initiating data deletion for user: ${userId}, confirmation: ${confirmationCode}`
    );

    // Example of what you'd do in production:
    /*
    try {
      await fetch('/api/user-data-deletion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          confirmationCode,
          requestDate: new Date().toISOString(),
          source: 'facebook_callback'
        })
      });
    } catch (error) {
      console.error('Failed to initiate deletion:', error);
    }
    */
  };

  // This component should return JSON for Facebook's callback
  // In production, this would be handled server-side
  if (response) {
    // Set content type to JSON
    // document.contentType = "application/json";

    return (
      <>
        <GuestHeader />
        <div
          style={{
            fontFamily: "monospace",
            padding: "20px",
            backgroundColor: "#f5f5f5",
            minHeight: "100vh",
          }}>
          <h1>Facebook Data Deletion Callback</h1>
          <h2>✅ Request Processed Successfully</h2>

          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              marginTop: "20px",
              border: "1px solid #ddd",
            }}>
            <h3>JSON Response for Facebook:</h3>
            <pre
              style={{
                backgroundColor: "#f8f9fa",
                padding: "15px",
                borderRadius: "4px",
                overflow: "auto",
              }}>
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>

          <div style={{ marginTop: "20px" }}>
            <p>
              <strong>Status URL:</strong>
            </p>
            <Link
              to={response.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#0066cc", textDecoration: "underline" }}>
              {response.url}
            </Link>
          </div>

          <div style={{ marginTop: "15px" }}>
            <p>
              <strong>Confirmation Code:</strong>{" "}
              <code>{response.confirmation_code}</code>
            </p>
          </div>

          <div
            style={{
              marginTop: "30px",
              padding: "15px",
              backgroundColor: "#e8f4fd",
              borderRadius: "4px",
              border: "1px solid #b3d9ff",
            }}>
            <h4>📋 Next Steps:</h4>
            <ol>
              <li>User can visit the status URL to track deletion progress</li>
              <li>Data deletion process will begin within 24 hours</li>
              <li>Complete deletion within 30 days as per privacy policy</li>
              <li>User will receive confirmation when deletion is complete</li>
            </ol>
          </div>
        </div>

        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <GuestHeader />
        <div
          style={{
            fontFamily: "monospace",
            padding: "20px",
            color: "red",
            backgroundColor: "#fff5f5",
            minHeight: "100vh",
          }}>
          <h2>❌ Error Processing Request</h2>
          <p>{error}</p>
          <div style={{ marginTop: "20px" }}>
            <p>
              Please contact support at:{" "}
              <Link to="mailto:privacy@interestminers.com">
                privacy@interestminers.com
              </Link>
            </p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <GuestHeader />
      <div
        style={{
          fontFamily: "monospace",
          padding: "20px",
          backgroundColor: "#f0f9ff",
          minHeight: "100vh",
        }}>
        <h2>🔄 Processing Facebook Data Deletion Request...</h2>
        <p>Please wait while we process your data deletion request.</p>
      </div>
      <Footer />
    </>
  );
};

export default DataDeletionCallback;
