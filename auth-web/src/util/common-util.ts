import 'moment-timezone'
import { Address, BaseAddressModel } from '@/models/address'
import { NrRequestActionCodes, NrRequestTypeCodes } from '@bcrs-shared-components/enums'
import { NrRequestTypeStrings } from '@/util/constants'
import moment from 'moment'

type DateLike = string | Date | moment.Moment

/**
 * A class to put all the common utility methods.
 */
export default class CommonUtils {
  // formats two dates into a range string, takes in most date formats
  // eg1. formatDateRange('2021-01-01', new Date()) => 'January 01, 2021 - May 27, 2024'
  // eg2. formatDateRange('March 1 2024', moment()) => 'March 01 - May 27, 2024'
  static formatDateRange (date1: DateLike, date2: DateLike): string {
    const dateObj1 = moment(date1)
    const dateObj2 = moment(date2)
    const year = (dateObj1.year() === dateObj2.year()) ? dateObj1.year() : ''
    const month = (dateObj1.month() === dateObj2.month()) ? dateObj1.format('MMMM') : ''
    if (date1 === date2) {
      return dateObj1.format('MMMM DD, YYYY')
    } else if (year && !month) {
      return `${dateObj1.format('MMMM DD')} - ${dateObj2.format('MMMM DD')}, ${year}`
    } else if (year && month) {
      return `${month} ${dateObj1.date()} - ${dateObj2.date()}, ${year}`
    } else {
      return `${dateObj1.format('MMMM DD, YYYY')} - ${dateObj2.format('MMMM DD, YYYY')}`
    }
  }

  // checking url matches the regex
  static isUrl (value:string): boolean {
    return value?.startsWith('http')
  }

  static formatAccountDisplayName (item: any) {
    return `${item?.accountId} ${item?.accountName}`
  }

  // formatting incorporation number according to the length of numbers
  static formatIncorporationNumber (incorpNum: string, numLength = 7):string {
    if (!incorpNum) return null
    const numberFirstIndex = incorpNum.search(/[0-9]/i)
    if (numberFirstIndex > -1) {
      // cut,trim and replace special characters from the first part
      let businessIdentifierStr = incorpNum.substring(0, numberFirstIndex).trim()
      businessIdentifierStr = businessIdentifierStr.replace(/[^a-zA-Z]/g, '')
      // cut, get rid of alpha and special chars, and pad '0's according to the numLength
      // if length is less than numLength, trim to numLength if otherwise
      let businessIdentifierNumbers = incorpNum.substring(numberFirstIndex)
      businessIdentifierNumbers = parseInt(businessIdentifierNumbers.replace(/[^0-9]/g, '')).toString()
      if (businessIdentifierNumbers.length && businessIdentifierNumbers.length < numLength) {
        businessIdentifierNumbers = businessIdentifierNumbers.padStart(numLength, '0')
      } else if (businessIdentifierNumbers.length && businessIdentifierNumbers.length > numLength) {
        businessIdentifierNumbers = businessIdentifierNumbers.substring(0, numLength)
      }
      // join both first part and second part
      incorpNum = `${businessIdentifierStr}${businessIdentifierNumbers}`
    }
    return incorpNum.toUpperCase()
  }

  static validateIncorporationNumber (value: string):boolean {
    const VALID_FORMAT = new RegExp(/^(A|B|BC|C|CP|EPR|FM|FOR|LIC|LL|LLC|LP|MF|QA|QB|QC|QD|QE|REG|S|S-|S\/|XL|XP|XS|XS-|XS\/|CS|CS-|CS\/)?\d+$/)
    return VALID_FORMAT.test(value?.toUpperCase())
  }

  static isCooperativeNumber (value: string):boolean {
    return value?.toUpperCase().startsWith('CP') || false
  }

  static isFirmNumber (value: string):boolean {
    return value?.toUpperCase().startsWith('FM') || false
  }

  static validateEmailFormat (value: string):boolean {
    const VALID_FORMAT = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
    return VALID_FORMAT.test(value)
  }

  static validatePhoneNumber (value: string):boolean {
    return value?.length <= 12 || false
  }

  /**
   * Validates a cooperative passcode:
   * - must be exactly 9 characters long
   * - must be numeric (0-9)
   * @param value the passcode to validate
   * @returns True if the passcode is valid, else False
   */
  static validateCooperativePasscode (value: string):boolean {
    const VALID_PASSWORD_FORMAT = new RegExp(/^\d{9}$/)
    return VALID_PASSWORD_FORMAT.test(value)
  }

  /**
   * Validates a corporate password:
   * - must be 8 to 15 characters long
   * - must be alphanumeric (a-z, A-Z, 0-9)
   * - is case sensitive (ie, ABCDEF is not the same as abcdef)
   * @param value the password to validate
   * @returns True if the password is valid, else False
   */
  static validateCorporatePassword (value: string):boolean {
    const VALID_PASSWORD_FORMAT = new RegExp(/^[a-z,A-Z,0-9]{8,15}$/)
    return VALID_PASSWORD_FORMAT.test(value)
  }

  // This will validate the password rules with the regex
  // atleast 1 number, 1 uppercase, 1 lowercase, 1 special character and minimum length is 8
  static validatePasswordRules (value: string):boolean {
    const VALID_PASSWORD_FORMAT = new RegExp(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/)
    return VALID_PASSWORD_FORMAT.test(value)
  }

  // Formatting phone number in the desired format for displaying in the template eg: (123) 456-7890
  static toDisplayPhone (phoneNumber: string): string {
    // Filter only numbers from the input
    const cleaned = ('' + phoneNumber).replace(/\D/g, '')

    // Check if the input is of correct length
    const regex = /^(\d{3})(\d{3})(\d{4})$/
    const match = regex.exec(cleaned)

    if (match) {
      return '(' + match[1] + ') ' + match[2] + '-' + match[3]
    } else return phoneNumber
  }

  // Format amount for displaying dollar currency
  static formatAmount (amount: number): string {
    return amount.toLocaleString('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  // Formatting date in the desired format for displaying in the template
  static formatDisplayDate (date: DateLike, format?: string) {
    // not working in CI (getting UTC datetime)
    return (date) ? moment(date.toLocaleString('en-US', { timeZone: 'America/Vancouver' }))
      .format(format || 'YYYY-MM-DD') : ''
  }

  // Formatting date in the desired format for vue date pickers
  static formatDatePickerDate (date?: Date) {
    return moment(date || new Date()).format('YYYY-MM-DD')
  }

  static formatDateToHumanReadable (date: DateLike) {
    return moment(date).format('MMMM DD, YYYY')
  }

  // Formatting date in the desired format for vue date pickers
  static formatCurrentDate () {
    return moment(new Date()).format('MMMM DD, YYYY')
  }

  static formatUtcToPacificDate (dateStr: string, format: string): string {
    if (!dateStr) return ''
    const date = moment.utc(dateStr).toDate()
    return (date) ? moment(date).tz('America/Vancouver')
      .format(format) : ''
  }

  static formatStatementString (fromDate: string, toDate: string) {
    let result = `Statement: ${CommonUtils.formatDisplayDate(moment(fromDate), 'MMMM DD')} -`
    result += `${CommonUtils.formatDisplayDate(moment(toDate), 'DD, YYYY')}`
    return result
  }

  static fileDownload (data: any, fileName: string, fileType: string = 'text/plain') {
    const blob = new Blob([data], { type: fileType })
    if (typeof window.navigator.msSaveBlob !== 'undefined') {
      // IE workaround for "HTML7007: One or more blob URLs were
      // revoked by closing the blob for which they were created.
      // These URLs will no longer resolve as the data backing
      // the URL has been freed."
      window.navigator.msSaveBlob(blob, fileName)
    } else {
      const blobURL = window.URL?.createObjectURL
        ? window.URL.createObjectURL(blob) : window.webkitURL.createObjectURL(blob)
      const tempLink = document.createElement('a')
      tempLink.style.display = 'none'
      tempLink.href = blobURL
      tempLink.setAttribute('download', fileName)

      // Safari thinks _blank anchor are pop ups. We only want to set _blank
      // target if the browser does not support the HTML5 download attribute.
      // This allows you to download files in desktop safari if pop up blocking
      // is enabled.
      if (typeof tempLink.download === 'undefined') {
        tempLink.setAttribute('target', '_blank')
      }
      document.body.appendChild(tempLink)
      tempLink.click()
      setTimeout(() => {
        document.body.removeChild(tempLink)
        window.URL.revokeObjectURL(blobURL)
      }, 200)
    }
  }

  static isSigningIn ():boolean {
    const path = window.location.pathname
    return path.includes('/signin') || path.includes('/signin-redirect') || path.includes('/signin-redirect-full')
  }

  static isSigningOut ():boolean {
    const path = window.location.pathname
    return path.includes('/signout')
  }

  // for converting address object of sbc-auth to as needed for BaseAddress component
  static convertAddressForComponent (address: Address) : BaseAddressModel {
    return {
      addressCity: address.city,
      addressCountry: address.country,
      addressRegion: address.region,
      deliveryInstructions: address.deliveryInstructions,
      postalCode: address.postalCode,
      streetAddress: address.street,
      streetAddressAdditional: address.streetAdditional
    }
  }

  // for converting address object of BaseAddress component to as needed for sbc-auth
  static convertAddressForAuth (iaddress: BaseAddressModel) : Address {
    return {
      city: iaddress.addressCity,
      country: iaddress.addressCountry,
      region: iaddress.addressRegion,
      deliveryInstructions: iaddress.deliveryInstructions,
      postalCode: iaddress.postalCode,
      street: iaddress.streetAddress,
      streetAdditional: iaddress.streetAddressAdditional
    }
  }

  static customSort (items, index, isDescending) {
    const isDesc = isDescending.length > 0 && isDescending[0]
    items.sort((a, b) => {
      if (isDesc) {
        return a[index[0]] < b[index[0]] ? -1 : 1
      } else {
        return b[index[0]] < a[index[0]] ? -1 : 1
      }
    })
    return items
  }

  static extractAndConvertStringToNumber (str: string) {
    return Number(str.replace(/\D/g, ''))
  }

  // patten/token for v-mask directive
  static numberAndXMaskPattern () {
    return {
      // allow X and number for masking
      D: {
        pattern: /[\dX]/
      },
      '#': {
        pattern: /\d/
      }
    }
  }

  // allowing only number and X character in v-mask directive
  static accountMask () {
    return {
      mask: 'DDDDDDDDDDDD',
      tokens: CommonUtils.numberAndXMaskPattern(),
      masked: true
    }
  }

  static emailRules (isOptional: boolean = false) {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (isOptional) {
      return [
        v => !v || pattern.test(v) || 'Valid email is required'
      ]
    } else {
      return [
        v => !!v || 'Email address is required',
        v => pattern.test(v) || 'Valid email is required'
      ]
    }
  }

  // format number to two places - for eg 2 => 02, 10 => 10.
  static formatNumberToTwoPlaces (index: number): string {
    const stringIndexValue: string = index.toString()
    return stringIndexValue.padStart(2, '0')
  }

  // trim last slas from URL
  static trimTrailingSlashURL (url) {
    return (url) ? url.trim().replace(/\/+$/, '') : ''
  }

  /** use NR request action code to get NR type from enum */
  static mapRequestActionCdToNrType (requestActionCd: NrRequestActionCodes): string {
    // Can add other NrRequestActionCodes here to use the action code instead of the NrRequestTypeCd.
    // Must ensure that the action code does not have several potential types
    // Example: the NEW action code can be for Incorporation or Registration, so we cannot use it for the NR type
    if (requestActionCd === NrRequestActionCodes.AMALGAMATE) { return 'Amalgamation' }
    return ''
  }

  /** use NR request type code to get NR type from enum */
  static mapRequestTypeCdToNrType (requestTypeCd: NrRequestTypeCodes): string {
    return NrRequestTypeStrings[requestTypeCd] as string
  }

  static getElementWithSmallestId<Type extends {id:number}> (arrayToSearch: Type[]): Type | undefined {
    return arrayToSearch?.reduce(
      (currentMin, curr) => (currentMin.id <= curr.id) ? currentMin : curr,
      arrayToSearch.length > 0 ? arrayToSearch[0] : undefined
    )
  }

  static formatSnakeCaseToTitle (text: string): string {
    if (!text) return ''
    if (!text.includes('_')) return text
    return text
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }
}
