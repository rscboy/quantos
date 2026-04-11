export const openApiYaml = `openapi: 3.0.1
info:
  title: MyFedPlan API
  description: "Federal retirement calculators that accurately compute <b>FERS</b>, CSRS, military deposits, TSP, and social security. <br/><br/>Also includes savings gap calculator."
  version: '2022.1'
  termsOfService: "https://myfedplan.com/termsandconditions.htm"
  contact:
    name: "MyFedPlan API"
    url: "https://myfedplan.com/api"
    email: "support@myfedplan.com"
  license:
    name: "License to use MyFedPlan"
    url: "https://myfedplan.com/price"
security:
  - jwt: []
paths:
  /login:
    post:
      tags:
        - Login to API site to being all calculator access
      summary: "Login endpoint used to begin API session."
      description: "Send user name and password through POST data. The returned bearer token can be used for multiple calls to the other APIs until its time has expired. Default timeout is 20 minutes."
      operationId: Login
      security: []
      externalDocs:
        description: API Documentation
        url: https://www.myfedplan.com
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                name:
                  type: string
                password:
                  type: string
      responses:
        '200':
          description: JWT token upon successful login
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/JWT"
  /howsoon:
    post:
      tags:
        - Federal Employee - How Soon To Retire
      summary: "Earliest retirement date for Federal employee."
      description: "Send employee start date of service, date of birth, and other job classification options (law enforcement, air traffic controller, and border agent) to calculate a person's earliest date which they would qualify for a federal annuity.<p>Other portions of the FedEmployee object are optional and not used for this calculator.<p>Relevant portions in FedEmployee object to be set for the HowSoon calculator:<p><ul><li>dateOfBirth</li><li>dateServiceComp</li><li>bLawEnforce (optional)</li><li>bAirTraffic (optional)</li><li>bCustomsBorderPatrol (optional)</li><li>bPhasedRetire (optional)</li><li>email (optional)</li></ul>"
      operationId: HowSoon
      externalDocs:
        description: API Documentation
        url: https://www.myfedplan.com
      parameters:
        - $ref: '#/components/parameters/FedEmployee'
      responses:
        '200':
          description: Report of how soon an employee can retire
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/howsoonRpt"
        '401':
          $ref: '#/components/responses/Unauthorized'
        '400':
          $ref: '#/components/responses/BadRequestFormat'

  /fers:
    post:
      tags:
        - Federal Employee - FERS Annuity Calculation
      summary: "FERS annuity calculation for one employee"
      description: "Calculates an estimate of a federal employee's monthly FERS annuity based on inputs sent in a full data packet such as their date of birth, planned retirement date, employee job classification, service time, pay history data, and other optional historical data. See the myfedplan.com website for guided walkthrough of collecting this data."
      operationId: FERSAnnuity
      externalDocs:
        description: API Documentation
        url: https://www.myfedplan.com
      parameters:
        - $ref: '#/components/parameters/FedEmployee'
      responses:
        '200':
          description: Report of how soon an employee can retire
          content:
            application/json:    
              schema:
                $ref: "#/components/schemas/annuityRpt"
        '400':
          $ref: '#/components/responses/BadRequestFormat' 
        '401':
          $ref: '#/components/responses/Unauthorized'  
        '404':
          $ref: '#/components/responses/NotFound'

  /csrs:
    post:
      tags:
        - Federal Employee - CSRS Annuity Calculation
      summary: "CSRS annuity calculation for one employee"
      description: "Calculates an estimate of a federal employee's monthly CSRS annuity based on inputs sent in a full data packet such as their date of birth, planned retirement date, employee job classification, service time, pay history data, and other optional historical data. See the myfedplan.com website for guided walkthrough of collecting this data."
      operationId: CSRSAnnuity
      externalDocs:
        description: API Documentation
        url: https://www.myfedplan.com
      parameters:
        - $ref: '#/components/parameters/FedEmployee'
      responses:
        '200':
          description: Report of how soon an employee can retire
          content:
            application/json:    
              schema:
                $ref: "#/components/schemas/annuityRpt"
        '400':
          $ref: '#/components/responses/BadRequestFormat' 
        '401':
          $ref: '#/components/responses/Unauthorized'  
        '404':
          $ref: '#/components/responses/NotFound'

components:
  securitySchemes:
    jwt:
      type: http
      scheme: bearer
      bearerFormat: JWT

  schemas:
    dateType:
      description: Date value in YYYY-MM-DD format
      type: string
      format: date
      pattern: /([0-9]{4})-(?:[0-9]{2})-([0-9]{2})/
      example: "2022-12-31"

    booleanType:
      description: Other values are accepted are 'T'/'F', 1/0, TRUE/FALSE, and YES/NO. Case is not sensitive.
      type: string
      pattern: /(YN)/
      example: "N"
      default: "N"
       
    yearType:
      description: Fractional year, whole number plus fraction of 360-day federal year
      type: number
      example: "3.25"
      default: "0.0"
     
    Error:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
      required:
        - code
        - message

    annuityRpt:
      description: Successful response - Annuity Estimate. FedEmployee structure contains calculated values including monthly annuity in property fFedAnnuity.
      type: object
      properties:
        id:
          $ref: '#/components/schemas/FedEmployee/properties/id'
        RetSystem:
          type: string
          description: CSRS or FERS indicator
          example: "CSRS"
        dateRetire:
          $ref: '#/components/schemas/FedEmployee/properties/dateRetire'
        dateServiceComp:
          $ref: '#/components/schemas/FedEmployee/properties/dateServiceComp'
        dateOfBirth:
          $ref: '#/components/schemas/FedEmployee/properties/dateOfBirth'
        EmployeeType:
          type: string
          description: Special rules used for calculation. 'Regular', 'Air Traffic Controller', 'Law Enforcement or Firefighter', or 'Customs and Border Protection' 
          example: "Regular"
        MonthlyAnnuity:
          $ref: '#/components/schemas/FedEmployee/properties/fFedAnnuity'
        Age:
          $ref: '#/components/schemas/yearType'
        ServiceTime:
          $ref: '#/components/schemas/yearType'
        Post90RedepositTime:
          $ref: '#/components/schemas/yearType'
        Post82RedepositTime:
          $ref: '#/components/schemas/yearType'
        SickLeaveHrs:
          type: number
        High3:
          type: number
        PctHigh3:
          type: number
        BasicAnnuityMo:
          type: number
        bPartTime:
          $ref: '#/components/schemas/booleanType'
        bPhasedRetire:
          $ref: '#/components/schemas/FedEmployee/properties/bPhasedRetire'
        AnnualLeaveValue:
          type: number
        RedepositDeduction:
          type: number
        DepositDeduction:
          type: number
        EarlyOutDeduction:
          type: number
        MRADeduction:
          type: number
        TotalLifeDeduction:
          type: number
        SurvivorDeduction:
          type: number
        HealthInsDeduction:
          type: number
        html:
          type: string
          description: HTML formatted report
          example: "<b>This employee can retire on ..."

    howsoonRpt:
      description: Successful response - How Soon to Retire
      type: object
      properties:
        id:
          $ref: '#/components/schemas/FedEmployee/properties/id'
        dateServiceComp:
          $ref: '#/components/schemas/FedEmployee/properties/dateServiceComp'
        dateOfBirth:
          $ref: '#/components/schemas/FedEmployee/properties/dateOfBirth'
        EmployeeType:
          type: string
          description: Special rules used for calculation. 'Regular', 'Air Traffic Controller', 'Law Enforcement or Firefighter', or 'Customs and Border Protection' 
          example: "Regular"
        RetSystem:
          type: string
          description: CSRS or FERS indicator
          example: "CSRS"
        FullRetire:
          description: Earliest date when a person is eligible for full retirment benefits.
          allOf:
            - $ref: '#/components/schemas/dateType'
        PartialRetire:
          description: Earliest date when a person is eligible for partial retirment benefits.
          allOf:
            - $ref: '#/components/schemas/dateType'
        bPhasedEligible:
          description: Set to 'Y' when person is eligible for phased retirement.
          allOf:
            - $ref: '#/components/schemas/booleanType'
        html:
          type: string
          description: HTML formatted report
          example: "<b>This employee can retire on ..."
      
    JWT:
      description: Java Web Token authentication. Pass the returned acces_token value through the Authorization header as a Bearer token to other calculator APIs. 
      type: object
      properties:
        access_token:
          type: string
          description: Base64 string value of the signed access token. Pass this value to the calculators via the Authorization header and add the prefix 'Bearer '.
        expires_in:
          type: number
          description: Seconds (from now) that the token will be valid, from time of being issued.

    FedEmployee:
      type: object
      properties:
        id:
          description: A unique company or agency identifier for an individual - not PII
          type: string
          pattern: ^[A-Za-z0-9\\-]*
          maxLength: 32
          example: "1001234567"
        bCSRS:
          description: Set to True when employee is in CSRS system. Set to False when employee is in FERS.
          allOf:
            - $ref: '#/components/schemas/booleanType'
        dateOfBirth:
          description: Date of Birth
          allOf:
            - $ref: '#/components/schemas/dateType'
        dateRetire:
          description: "Date that employee plans to retire"
          additionalProperties:
            $ref: '#/components/schemas/dateType'
        dateServiceComp:
          description: Servive Comp Date. The effective date when a person began their employment with the government.
          allOf:
            - $ref: '#/components/schemas/dateType'
        bLawEnforce:
          description: 'Flag to indicate that employee is in law enforcement role, and to apply those special rules.'
          allOf:
          - $ref: '#/components/schemas/booleanType'
        bAirTraffic:
          $ref: '#/components/schemas/booleanType'
        bCustomsBorderPatrol:
          description: 'Flag to indicate that employee is in customs and border patrol, and to apply those special rules.'
          allOf:
            - $ref: '#/components/schemas/booleanType'
        bPhasedRetire:
          description: 'Flag to indicate a check for special rules that could apply if the employee decides to have a phased retirement.'
          allOf:
            - $ref: '#/components/schemas/booleanType'
        dateMilFrom:
          $ref: '#/components/schemas/dateType'
        dateMilTo:
          $ref: '#/components/schemas/dateType'
        dateSpecialFrom:
          $ref: '#/components/schemas/dateType'
        dateSpecialTo:
          $ref: '#/components/schemas/dateType'
        dateCSRSTransfer:
          $ref: '#/components/schemas/dateType'
        dateAnniversaryDate:
          $ref: '#/components/schemas/dateType'
        bLifeIns:
          $ref: '#/components/schemas/booleanType'
        email:
          description: >-
            Email address of the person to whom the report will be sent.
          type: string
          format: rfc5322email
          minLength: 0
          maxLength: 127
        zipCode:
          description: Region of the US where the person resides
          type: string
          pattern: ^[0-9\\-]*
          maxLength: 10
          example: "20245"
        personName:
          type: string
          pattern: ^[A-Za-z\\-', ]*
          maxLength: 100
          example: "John Smith"
        bLifeInsA:
          $ref: '#/components/schemas/booleanType'
        bLifeInsB:
          $ref: '#/components/schemas/booleanType'
        bLifeInsC:
          $ref: '#/components/schemas/booleanType'
        bLifeFullOptionB:
          $ref: '#/components/schemas/booleanType'
        bLifeFullOptionC:
          $ref: '#/components/schemas/booleanType'
        bEarlyOut:
          $ref: '#/components/schemas/booleanType'
        bSSEligible:
          $ref: '#/components/schemas/booleanType'
        bSpecialComp:
          $ref: '#/components/schemas/booleanType'
        bCSRSTransfer:
          $ref: '#/components/schemas/booleanType'
        bRptSummary:
          $ref: '#/components/schemas/booleanType'
        bRptAnnuity:
          $ref: '#/components/schemas/booleanType'
        bRptTSP:
          $ref: '#/components/schemas/booleanType'
        bRptFEGLI:
          $ref: '#/components/schemas/booleanType'
        bRptFEHB:
          $ref: '#/components/schemas/booleanType'
        bRptLTC:
          $ref: '#/components/schemas/booleanType'
        bRptSocSec:
          $ref: '#/components/schemas/booleanType'
        bRptData:
          $ref: '#/components/schemas/booleanType'
        bRptGap:
          $ref: '#/components/schemas/booleanType'
        nSickLeaveHrs:
          type: integer
        nAnnualLeaveHrs:
          type: integer
        nLifeInsBasic:
          type: integer
        nLifeInsOption:
          type: integer
        nSurvivor:
          type: integer
        nSurvivorBase:
          type: integer
        nNumFunds:
          type: integer
        nFuncPctContrib:
          type: integer
        nXFerSickLeave:
          type: integer
        nSickMonths:
          type: integer
        fLastSalary:
          type: number
        fFedAnnuity:
          type: number
        fSocSec:
          type: number
        fHealthInsDeduct:
          type: number
        fCatchupContrib:
          type: number
        fSalaryCOLA:
          type: number
        fSickAnnual:
          type: number
        fAnnuityCOLA:
          type: number
        sLFundType:
          type: string
        fLFundBalance:
          type: number
        fLFundAlloc:
          type: number
        fManualHigh3:
          type: number
        fCalcHigh3:
          type: number
        fTotEarnings:
          type: number
        fCivilEarnings:
          type: number
        fEarnings1999:
          type: number
        fEarnings2000:
          type: number
        fCurBalance:
          type: number
        fCurrentYearSalary:
          type: number
        fFutureYearsSalary:
          type: number
        fPTS:
          type: number
        fRateOfReturn:
          type: number
        fYearsR:
          type: number
        fOtherPensions:
          type: number
        fCurrentSavings:
          type: number
        arrSSEarnings:
          type: array
          items:
            type: number
          maxItems: 81
        salaryHistory:
          type: array
          items:
            title: salaryinfo
            type: object
            properties:
              startDate:
                $ref: '#/components/schemas/dateType'
              startAmount:
                type: number
          minItems: 1
          maxItems: 10
          uniqueItems: true
        deposits:
          type: array
          items:
            title: deposits not made
            type: object
            properties:
              fromDate:
                $ref: '#/components/schemas/dateType'
              toDate:
                $ref: '#/components/schemas/dateType'
              salary:
                type: number
          minItems: 1
          maxItems: 10
          uniqueItems: true
        redeposits:
          type: array
          items:
            title: redeposits made
            type: object
            properties:
              depositDate:
                $ref: '#/components/schemas/dateType'
              fromDate:
                $ref: '#/components/schemas/dateType'
              toDate:
                $ref: '#/components/schemas/dateType'
              amount:
                type: number
          minItems: 1
          maxItems: 10
          uniqueItems: true
        partTime:
          type: array
          items:
            title: parttime service
            type: object
            properties:
              fromDate:
                $ref: '#/components/schemas/dateType'
              toDate:
                $ref: '#/components/schemas/dateType'
              hrsPerPeriod:
                type: number
          minItems: 1
          maxItems: 5
          uniqueItems: true

  parameters:
    FedEmployee:
      name: FedEmployee
      in: query
      description: Federal Employee Data
      schema:
        $ref: '#/components/schemas/FedEmployee'
      required: true

  responses:
    NotFound:
      description: Some necessary data elements were missing from the request body.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    BadRequestFormat:
      description: The syntax of the sent JSON is either formatted incorrectly or is missing one or more necessary data elements for the selected calculator.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
    Unauthorized:
      description: Unauthorized
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'

servers:
  - url: https://www.myfedplan.com/api/
    description: Production API server
  - url: https://www.myfedplan.com/apitest/
    description: Beta API server
  - url: https://www.myfedplan.com/
    description: Interactive retirement planning web portal
`;
