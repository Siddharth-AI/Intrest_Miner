/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import GuestHeader from "@/components/layout/GuestHeader";

const DataDeletion = () => {
  const [confirmationCode, setConfirmationCode] = useState("");
  const [deletionStatus, setDeletionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Get confirmation code from URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      setConfirmationCode(id);
      checkDeletionStatus(id);
    }
  }, []);

  const checkDeletionStatus = async (code: string) => {
    setLoading(true);
    try {
      // Simulate API call to check deletion status
      // In production, this would call your backend API
      setTimeout(() => {
        setDeletionStatus({
          confirmationCode: code,
          status: "processing", // processing, completed, failed
          requestDate: new Date().toISOString(),
          estimatedCompletion: new Date(
            Date.now() + 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
          dataTypes: [
            "Profile Information",
            "Search History",
            "Generated Interests",
            "Campaign Data",
            "Usage Analytics",
          ],
        });
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error checking deletion status:", error);
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (confirmationCode.trim()) {
      checkDeletionStatus(confirmationCode.trim());
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "processing":
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case "failed":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completed
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="default" className="bg-yellow-500">
            Processing
          </Badge>
        );
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <>
      <GuestHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-28 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Data Deletion Request Status
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Track the status of your data deletion request from InterestMiner.
              We take your privacy seriously and will process your request
              according to our privacy policy.
            </p>
          </div>

          {/* Search Section */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Check Deletion Status
              </CardTitle>
              <CardDescription>
                Enter your confirmation code to check the status of your data
                deletion request.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Label htmlFor="confirmationCode">Confirmation Code</Label>
                  <Input
                    id="confirmationCode"
                    placeholder="Enter your confirmation code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleSearch}
                    disabled={loading || !confirmationCode.trim()}>
                    {loading ? "Checking..." : "Check Status"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Display */}
          {deletionStatus && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    {getStatusIcon(deletionStatus.status)}
                    Deletion Request Details
                  </span>
                  {getStatusBadge(deletionStatus.status)}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Confirmation Code
                    </Label>
                    <p className="text-lg font-mono">
                      {deletionStatus.confirmationCode}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Request Date
                    </Label>
                    <p className="text-lg">
                      {new Date(
                        deletionStatus.requestDate
                      ).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Status
                    </Label>
                    <p className="text-lg capitalize">
                      {deletionStatus.status}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">
                      Estimated Completion
                    </Label>
                    <p className="text-lg">
                      {new Date(
                        deletionStatus.estimatedCompletion
                      ).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-3 block">
                    Data Being Deleted
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {deletionStatus.dataTypes.map(
                      (dataType: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{dataType}</span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {deletionStatus.status === "processing" && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-yellow-600" />
                      <h3 className="font-medium text-yellow-800">
                        Processing Your Request
                      </h3>
                    </div>
                    <p className="text-yellow-700 text-sm">
                      Your data deletion request is currently being processed.
                      This may take up to 30 days to complete. We will notify
                      you once the deletion is finished.
                    </p>
                  </div>
                )}

                {deletionStatus.status === "completed" && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="font-medium text-green-800">
                        Deletion Completed
                      </h3>
                    </div>
                    <p className="text-green-700 text-sm">
                      Your data has been successfully deleted from our systems.
                      If you have any questions, please contact our support
                      team.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Information Section */}
          <Card>
            <CardHeader>
              <CardTitle>Data Deletion Information</CardTitle>
              <CardDescription>
                Learn more about our data deletion process and your rights.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">What data do we delete?</h3>
                <p className="text-sm text-gray-600 mb-2">
                  When you request data deletion, we remove all personal
                  information associated with your account, including:
                </p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• Profile information and account details</li>
                  <li>• Search history and generated interests</li>
                  <li>• Campaign data and analytics</li>
                  <li>• Usage logs and preferences</li>
                  <li>• Any other personal data we may have collected</li>
                </ul>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Timeline</h3>
                <p className="text-sm text-gray-600">
                  Data deletion requests are typically processed within 30 days.
                  Some data may be retained for legal or security purposes as
                  outlined in our privacy policy.
                </p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Need Help?</h3>
                <p className="text-sm text-gray-600 mb-3">
                  If you have questions about your data deletion request, please
                  contact us:
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-blue-500" />
                    <Link
                      to="mailto:privacy@interestminers.com"
                      className="text-blue-600 hover:underline">
                      privacy@interestminers.com
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-blue-500" />
                    <span className="text-gray-600">
                      Support available 9 AM - 5 PM EST
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DataDeletion;
