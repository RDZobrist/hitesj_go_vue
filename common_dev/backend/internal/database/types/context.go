// Copyright August 2020 Maxset Worldwide Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package types

// ContextKey is used to store connections to a database in the values of a context
type ContextKey byte

// Context Keys for each type of database connection
const (
	DATABASE ContextKey = iota
	OWNER
	FILE
	STORE
	CONTENT
	TAG
	ACRONYM
	VIEW
)
