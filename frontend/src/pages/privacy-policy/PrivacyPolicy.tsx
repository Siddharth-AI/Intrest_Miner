import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, Trash2, Eye, Lock, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/components/layout/Footer";
import GuestHeader from "@/components/layout/GuestHeader";

const PrivacyPolicy = () => {
  return (
    <>
      <GuestHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-28 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Privacy Policy
            </h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString()}
            </p>
            <Badge variant="outline" className="mt-2">
              <Shield className="h-4 w-4 mr-1" />
              GDPR Compliant
            </Badge>
          </div>

          {/* Introduction */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">
                InterestMiner is committed to protecting your privacy. This
                Privacy Policy explains how we collect, use, disclose, and
                safeguard your information when you use our AI-powered interest
                discovery platform at <strong>www.interestminers.com</strong>.
              </p>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Personal Information</h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Name and email address</li>
                  <li>• Business information and industry details</li>
                  <li>• Account credentials and profile data</li>
                  <li>• Payment and billing information</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Usage Information</h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>• Search queries and generated interests</li>
                  <li>• Campaign data and analytics</li>
                  <li>• Platform usage patterns and preferences</li>
                  <li>• Device information and IP addresses</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Third-Party Data</h3>
                <ul className="text-gray-700 space-y-1 ml-4">
                  <li>
                    • Facebook Login information (if you choose to use it)
                  </li>
                  <li>• Social media profile data (with your consent)</li>
                  <li>• Marketing and advertising data</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Your Information */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="text-gray-700 space-y-2">
                <li>
                  • <strong>Service Delivery:</strong> Provide AI-powered
                  interest discovery and campaign generation
                </li>
                <li>
                  • <strong>Account Management:</strong> Create and maintain
                  your user account
                </li>
                <li>
                  • <strong>Communication:</strong> Send service updates,
                  support responses, and marketing communications
                </li>
                <li>
                  • <strong>Improvement:</strong> Analyze usage patterns to
                  enhance our platform
                </li>
                <li>
                  • <strong>Security:</strong> Protect against fraud and
                  unauthorized access
                </li>
                <li>
                  • <strong>Legal Compliance:</strong> Meet legal obligations
                  and enforce our terms
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Sharing */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Data Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We do not sell your personal information. We may share your
                information in the following circumstances:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>
                  • <strong>Service Providers:</strong> Third-party vendors who
                  help us operate our platform
                </li>
                <li>
                  • <strong>Legal Requirements:</strong> When required by law or
                  to protect our rights
                </li>
                <li>
                  • <strong>Business Transfers:</strong> In connection with
                  mergers or acquisitions
                </li>
                <li>
                  • <strong>With Consent:</strong> When you explicitly agree to
                  share your information
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Deletion Section */}
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-800">
                <Trash2 className="h-5 w-5" />
                Your Right to Data Deletion
              </CardTitle>
              <CardDescription className="text-red-700">
                You have the right to request deletion of your personal data at
                any time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-red-800">
                  How to Request Data Deletion
                </h3>
                <p className="text-red-700 mb-3">
                  You can request deletion of your data through the following
                  methods:
                </p>
                <ul className="text-red-700 space-y-2 ml-4">
                  <li>
                    • <strong>Facebook Users:</strong> Remove our app from your
                    Facebook account settings
                  </li>
                  <li>
                    • <strong>Email Request:</strong> Send a deletion request to{" "}
                    <Link
                      to="mailto:privacy@interestminers.com"
                      className="underline font-medium">
                      privacy@interestminers.com
                    </Link>
                  </li>
                  <li>
                    • <strong>Account Settings:</strong> Use the data deletion
                    option in your account dashboard
                  </li>
                  <li>
                    • <strong>Status Tracking:</strong> Check deletion status at{" "}
                    <Link
                      to="https://www.interestminers.com/data-deletion"
                      // to="http://localhost:8080/data-deletion"
                      className="underline font-medium">
                      www.interestminers.com/data-deletion
                    </Link>
                  </li>
                </ul>
              </div>

              <Separator className="bg-red-200" />

              <div>
                <h3 className="font-semibold mb-2 text-red-800">
                  What Gets Deleted
                </h3>
                <ul className="text-red-700 space-y-1 ml-4">
                  <li>• All personal profile information</li>
                  <li>• Search history and generated interests</li>
                  <li>• Campaign data and analytics</li>
                  <li>• Account preferences and settings</li>
                  <li>• Usage logs and activity data</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-red-800">
                  Deletion Timeline
                </h3>
                <p className="text-red-700">
                  Data deletion requests are processed within{" "}
                  <strong>30 days</strong>. You will receive a confirmation code
                  to track your request status. Some data may be retained for
                  legal or security purposes as required by law.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                We implement appropriate technical and organizational measures
                to protect your personal information:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>
                  • <strong>Encryption:</strong> Data encrypted in transit and
                  at rest
                </li>
                <li>
                  • <strong>Access Controls:</strong> Limited access on a
                  need-to-know basis
                </li>
                <li>
                  • <strong>Regular Audits:</strong> Security assessments and
                  vulnerability testing
                </li>
                <li>
                  • <strong>Secure Infrastructure:</strong> Industry-standard
                  hosting and security practices
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="text-gray-700 space-y-2">
                <li>
                  • <strong>Access:</strong> Request copies of your personal
                  data
                </li>
                <li>
                  • <strong>Rectification:</strong> Request correction of
                  inaccurate data
                </li>
                <li>
                  • <strong>Erasure:</strong> Request deletion of your personal
                  data
                </li>
                <li>
                  • <strong>Portability:</strong> Request transfer of your data
                </li>
                <li>
                  • <strong>Objection:</strong> Object to processing of your
                  data
                </li>
                <li>
                  • <strong>Restriction:</strong> Request limitation of data
                  processing
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                If you have questions about this Privacy Policy or our data
                practices, please contact us:
              </p>
              <div className="space-y-2">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  <strong>Email:</strong>
                  <Link
                    to="mailto:privacy@interestminers.com"
                    className="text-blue-600 hover:underline">
                    privacy@interestminers.com
                  </Link>
                </p>
                <p>
                  <strong>Website:</strong> www.interestminers.com
                </p>
                <p>
                  <strong>Data Deletion Requests:</strong>{" "}
                  <Link
                    to="https://www.interestminers.com/data-deletion"
                    className="text-blue-600 hover:underline">
                    www.interestminers.com/data-deletion
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default PrivacyPolicy;
