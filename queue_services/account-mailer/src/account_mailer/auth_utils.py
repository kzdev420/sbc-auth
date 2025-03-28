# Copyright © 2019 Province of British Columbia
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
"""Auth Utils.

Generic utils to help auth functions.
"""

from auth_api.models import User as UserModel
from auth_api.utils.enums import Status
from flask import current_app


def get_member_emails(org_id, roles):
    """Get emails for the user role passed in."""
    member_list = UserModel.find_users_by_org_id_by_status_by_roles(org_id, roles, Status.ACTIVE.value)
    member_emails = ",".join([str(x.contacts[0].contact.email) for x in member_list if x.contacts])
    return member_emails


def get_login_url():
    """Get application login url."""
    login_url = current_app.config.get("WEB_APP_URL")
    return login_url


def get_transaction_url(org_id: str) -> str:
    """Get transaction url."""
    web_app_url = current_app.config.get("WEB_APP_URL")
    transaction_url = f"{web_app_url}/account/{org_id}/settings/transactions"
    return transaction_url


def get_dashboard_url():
    """Get application dashboard url."""
    login_url = current_app.config.get("DASHBOARD_URL")
    return login_url


def get_payment_statements_url(org_id: str) -> str:
    """Get auth web statement url for an org."""
    if not org_id:  # Safeguard as this is now part of the common_mailer processing
        return ""

    web_app_url = current_app.config.get("WEB_APP_URL")
    web_app_statement_path_url = current_app.config.get("WEB_APP_STATEMENT_PATH_URL")

    web_app_statement_path_url = web_app_statement_path_url.replace("orgId", str(org_id))
    statement_path_url = web_app_url + web_app_statement_path_url

    return statement_path_url
