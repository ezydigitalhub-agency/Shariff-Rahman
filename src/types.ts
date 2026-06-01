/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ExperienceNode {
  company: string;
  role: string;
  duration: string;
  description: string;
  iconType: "broker" | "assist" | "bank" | "mentor";
}

export interface QualificationNode {
  title: string;
  institute: string;
  duration?: string;
  highlight?: string;
}

export interface MortgageService {
  id: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface ContactFormInput {
  name: string;
  email: string;
  phone: string;
  loanType: string;
  loanAmount: string;
  message: string;
}
