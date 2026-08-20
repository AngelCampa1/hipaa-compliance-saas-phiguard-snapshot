import { Bullets, Callout, P, PdfLayout, Section, Subsection, Table } from '../layout/PdfLayout.js'

export default function HipaaStaffTrainingQuizTemplateDocument() {
  return (
    <PdfLayout
      title="HIPAA Staff Training Quiz Template"
      subtitle="15 multiple-choice questions covering HIPAA basics, PHI handling, breach reporting, and workforce responsibilities."
    >
      <Section title="How to use this quiz">
        <P>
          Administer this quiz at the end of annual HIPAA training or as a standalone competency check. A passing
          score is 80% (12 of 15 correct). Document each staff member's name, date, score, and trainer name. Retain
          completed quizzes for 6 years under 45 CFR § 164.530(j). Staff who score below 80% should receive targeted
          remedial training before retaking.
        </P>
        <Table
          headers={['Staff Name', 'Date', 'Score', 'Pass / Remedial', 'Trainer']}
          rows={[
            ['', '', '', '', ''],
            ['', '', '', '', ''],
            ['', '', '', '', ''],
          ]}
        />
      </Section>

      <Section title="Section 1 - HIPAA Basics">
        <Callout label="Questions 1-5">
          Circle the best answer for each question.
        </Callout>
        <Subsection title="Question 1 - What does PHI stand for, and which of the following is an example?">
          <Bullets
            items={[
              "A. Personal Health Identity - a patient's hospital bracelet number",
              "B. Protected Health Information - a patient's name combined with their diagnosis",
              "C. Private Healthcare Item - a patient's insurance card number alone",
              'D. Personal Healthcare Information - aggregate clinic visit statistics with no identifiers',
            ]}
          />
          <P>Correct answer: B. PHI is individually identifiable health information held or transmitted by a covered entity (45 CFR § 160.103). A name plus a diagnosis qualifies. Aggregate statistics without identifiers do not.</P>
        </Subsection>

        <Subsection title="Question 2 - Which of the following is NOT a covered entity under HIPAA?">
          <Bullets
            items={[
              'A. A physician who bills Medicare electronically',
              'B. A health plan that pays for medical services',
              'C. A medical transcription company hired by a physician practice',
              'D. A healthcare clearinghouse that processes insurance claims',
            ]}
          />
          <P>Correct answer: C. A medical transcription company is a business associate, not a covered entity. Covered entities are health plans, health care clearinghouses, and health care providers who transmit health information electronically (45 CFR § 160.102).</P>
        </Subsection>

        <Subsection title="Question 3 - The minimum necessary standard requires that staff:">
          <Bullets
            items={[
              'A. Request and use only as much PHI as needed to accomplish the intended purpose',
              'B. Obtain patient authorization before accessing any PHI',
              'C. Limit PHI access to the privacy officer only',
              'D. Document every time PHI is accessed, regardless of purpose',
            ]}
          />
          <P>Correct answer: A. The minimum necessary standard (45 CFR § 164.502(b)) requires covered entities to make reasonable efforts to limit PHI to the minimum necessary to accomplish the intended purpose of the use, disclosure, or request.</P>
        </Subsection>

        <Subsection title="Question 4 - Under the Privacy Rule, a covered entity may disclose PHI for treatment, payment, and healthcare operations (TPO) without patient authorization. Which of the following is an example of a permissible treatment disclosure?">
          <Bullets
            items={[
              "A. Sharing a patient's diagnoses with the patient's employer",
              'B. Sending a referral with clinical notes to a specialist treating the same patient',
              'C. Providing a patient list to a marketing company for targeted campaigns',
              'D. Disclosing records to a life insurance company without patient authorization',
            ]}
          />
          <P>Correct answer: B. Sharing clinical information with another provider for treatment purposes is a permissible TPO disclosure under 45 CFR § 164.506. Disclosures to employers, marketing companies, and life insurers are not treatment disclosures.</P>
        </Subsection>

        <Subsection title="Question 5 - HIPAA's 6-year retention requirement applies to:">
          <Bullets
            items={[
              'A. All patient medical records at every covered entity',
              'B. Only records created after the HITECH Act',
              'C. Documentation of HIPAA policies, procedures, and compliance activities',
              'D. Billing records submitted to Medicare and Medicaid',
            ]}
          />
          <P>Correct answer: C. HIPAA requires retention of documentation of policies, procedures, and related compliance activities for 6 years (45 CFR §§ 164.530(j), 164.316(b)(2)). Medical records retention is governed by state law, not HIPAA.</P>
        </Subsection>
      </Section>

      <Section title="Section 2 - PHI Handling in Daily Work">
        <Callout label="Questions 6-10">
          Circle the best answer for each question.
        </Callout>
        <Subsection title="Question 6 - A patient calls asking for another patient's appointment time, saying they are the patient's spouse. What should you do?">
          <Bullets
            items={[
              'A. Provide the information because spouses are automatically authorized to receive PHI',
              'B. Ask the patient on file to add the spouse as an authorized representative first',
              'C. Check whether the clinic has a signed authorization from the patient authorizing release to the spouse',
              'D. Provide the appointment time only - it is not clinical PHI',
            ]}
          />
          <P>Correct answer: C. Appointment times can contain PHI (they link identity to the fact of receiving care). Without a signed authorization from the patient, the clinic should not release this information. Spousal status alone is not a HIPAA authorization.</P>
        </Subsection>

        <Subsection title="Question 7 - You notice that a coworker is looking at records of a well-known local patient out of curiosity, not for treatment purposes. What should you do?">
          <Bullets
            items={[
              'A. Nothing - coworkers are workforce members and have general access rights',
              'B. Report the incident to your supervisor or privacy officer',
              'C. Ask the coworker to stop and consider it resolved',
              'D. Report only if the coworker accesses records more than once',
            ]}
          />
          <P>Correct answer: B. Curiosity-driven access to PHI is an impermissible use under the minimum necessary standard. Workforce members must report suspected HIPAA violations to the privacy officer or supervisor. The privacy officer decides whether it rises to an incident or breach.</P>
        </Subsection>

        <Subsection title="Question 8 - Which of the following is an appropriate way to dispose of a paper document containing PHI?">
          <Bullets
            items={[
              'A. Toss it in the regular trash bin after tearing it in half',
              'B. Place it in the locked shred bin or shred it immediately using a cross-cut shredder',
              'C. Leave it face-down on the copier for the next person to handle',
              'D. Fold it and place it in a sealed envelope before discarding',
            ]}
          />
          <P>Correct answer: B. PHI on paper must be disposed of using methods that prevent unauthorized access - shredding or placing in a locked destruction bin. Torn documents and sealed envelopes in regular trash do not satisfy this requirement.</P>
        </Subsection>

        <Subsection title="Question 9 - A patient gives verbal permission for you to discuss their care in front of a family member present in the exam room. What is the correct approach?">
          <Bullets
            items={[
              'A. Refuse - HIPAA requires written authorization for any disclosure in front of third parties',
              "B. Document the verbal permission in the patient's record and proceed",
              'C. Require a signed release before the family member may remain in the room',
              'D. Proceed without documentation - verbal consent is irrelevant under HIPAA',
            ]}
          />
          <P>Correct answer: B. The Privacy Rule allows covered entities to use professional judgment when patients agree to the presence of others during treatment. Documenting the patient's verbal agreement creates the evidence trail. Written authorization is not required in this scenario.</P>
        </Subsection>

        <Subsection title="Question 10 - Your clinic uses a patient portal. A patient sends a message asking you to reply to their personal email instead. What should you do?">
          <Bullets
            items={[
              'A. Decline entirely - email communication with patients is prohibited under HIPAA',
              'B. Honor the request, document that the patient requested unencrypted email, and note the risk disclosed',
              'C. Require the patient to use only the secure portal without exception',
              'D. Use unencrypted email with no documentation since the patient requested it',
            ]}
          />
          <P>Correct answer: B. Patients have the right to request alternative communication methods. When a patient requests unencrypted email despite the risk, the covered entity may comply but should document the patient's request and note that the risk was explained. (HHS FAQ on electronic communications.)</P>
        </Subsection>
      </Section>

      <Section title="Section 3 - Breach Identification and Reporting">
        <Callout label="Questions 11-15">
          Circle the best answer for each question.
        </Callout>
        <Subsection title="Question 11 - Which of the following qualifies as a reportable breach under HIPAA's Breach Notification Rule?">
          <Bullets
            items={[
              "A. A staff member accidentally pulls up the wrong patient's chart and closes it immediately without viewing any data",
              'B. A billing report with patient names and diagnoses is emailed to the wrong outside accounting firm',
              'C. A locked filing cabinet is briefly left unattended in a hallway during an office move',
              "D. Two authorized staff members at the same practice discuss a patient's care in a private office",
            ]}
          />
          <P>Correct answer: B. Emailing PHI to an unauthorized recipient (an outside accounting firm without a BAA for that data) is an impermissible disclosure. Without evidence of low probability of compromise under the 4-factor analysis, this is a reportable breach. The other scenarios do not constitute unauthorized access or disclosure.</P>
        </Subsection>

        <Subsection title="Question 12 - How long does a covered entity have to notify affected individuals after discovering a breach?">
          <Bullets
            items={[
              'A. 24 hours after discovery',
              'B. 30 calendar days after discovery',
              'C. 60 calendar days after discovery',
              'D. 90 calendar days after the end of the calendar year in which the breach occurred',
            ]}
          />
          <P>Correct answer: C. Under 45 CFR § 164.404, covered entities must notify affected individuals without unreasonable delay and in no case later than 60 calendar days after discovery of the breach. Note: some state laws require shorter timelines.</P>
        </Subsection>

        <Subsection title="Question 13 - If a covered entity discovers a breach affecting 600 patients in one state, which notifications are required?">
          <Bullets
            items={[
              'A. Individuals only - HHS and media notification is optional',
              'B. Individuals, HHS (within 60 days of discovery), and prominent media in the affected state',
              'C. HHS only - individuals are notified by HHS',
              'D. Individuals and HHS - media notification is never required under federal HIPAA',
            ]}
          />
          <P>Correct answer: B. When a breach affects 500 or more individuals in a single state, the covered entity must notify: (1) affected individuals (§ 164.404), (2) HHS within 60 days of discovery (§ 164.408(b)), and (3) prominent media in the state (§ 164.406).</P>
        </Subsection>

        <Subsection title="Question 14 - A staff member leaves a laptop containing unencrypted patient records in a car, and it is stolen. Under the HIPAA Breach Notification Rule, this is:">
          <Bullets
            items={[
              'A. Not a breach because laptops are physical property, not electronic health records',
              'B. Presumed a reportable breach unless the low-probability analysis can demonstrate otherwise',
              'C. A near-miss event that requires documentation but not notification',
              'D. Not a breach because it involves hardware, not transmitted data',
            ]}
          />
          <P>Correct answer: B. Unencrypted PHI on a stolen laptop is unsecured PHI. Unless the covered entity can demonstrate a low probability that the PHI was compromised based on the 4-factor analysis (45 CFR § 164.402), this is a reportable breach.</P>
        </Subsection>

        <Subsection title="Question 15 - When should you report a suspected HIPAA incident to your privacy officer or supervisor?">
          <Bullets
            items={[
              'A. Only when you are certain a breach occurred',
              'B. Only when PHI was definitely seen by an unauthorized person',
              'C. As soon as you become aware of any possible unauthorized access, use, or disclosure of PHI',
              'D. After consulting with the affected patient to determine whether they want to report it',
            ]}
          />
          <P>Correct answer: C. Workforce members must report suspected incidents immediately upon awareness - not after self-investigation. The privacy officer or designated responder makes the determination of whether it is a breach. Delay in reporting can shorten the investigation window and cause the covered entity to miss notification deadlines.</P>
        </Subsection>
      </Section>

      <Section title="Answer key">
        <Table
          headers={['Question', 'Correct Answer', 'Regulatory Reference']}
          rows={[
            ['1', 'B', '45 CFR § 160.103'],
            ['2', 'C', '45 CFR § 160.102'],
            ['3', 'A', '45 CFR § 164.502(b)'],
            ['4', 'B', '45 CFR § 164.506'],
            ['5', 'C', '45 CFR §§ 164.530(j), 164.316(b)(2)'],
            ['6', 'C', '45 CFR § 164.502(b)'],
            ['7', 'B', '45 CFR § 164.530(d)'],
            ['8', 'B', '45 CFR § 164.310(d)(2)(i)'],
            ['9', 'B', 'HHS Guidance on Incidental Uses and Disclosures'],
            ['10', 'B', 'HHS FAQ on Electronic Communications'],
            ['11', 'B', '45 CFR § 164.402'],
            ['12', 'C', '45 CFR § 164.404'],
            ['13', 'B', '45 CFR §§ 164.404, 164.406, 164.408'],
            ['14', 'B', '45 CFR § 164.402; 2009 Breach Notification Guidance'],
            ['15', 'C', '45 CFR § 164.308(a)(6)'],
          ]}
        />
      </Section>

      <Section title="From PHIGuard">
        <P>
          PHIGuard tracks training completion and quiz results per staff member with timestamps so your training
          record is ready when an auditor asks. See phiguard.app.
        </P>
      </Section>
    </PdfLayout>
  )
}
